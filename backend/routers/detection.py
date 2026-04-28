from __future__ import annotations

import re
import time
from html.parser import HTMLParser
from urllib.parse import urljoin

import httpx
from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel, HttpUrl

from core import compare_phashes, fingerprint_bytes, fingerprint_upload, firestore_client, utc_now_iso, verify_firebase_token

router = APIRouter(prefix="/api/detect", tags=["detection"])


class UrlScanRequest(BaseModel):
    url: HttpUrl
    owner_uid: str | None = None


class ImageSrcParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.srcs: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag.lower() != "img":
            return
        values = dict(attrs)
        src = values.get("src") or values.get("data-src")
        if src:
            self.srcs.append(src)


def _owner_assets(uid: str) -> list[dict]:
    docs = firestore_client().collection("assets").where("owner_uid", "==", uid).stream()
    assets = []
    for doc in docs:
        data = doc.to_dict() or {}
        phash = (data.get("fingerprints") or {}).get("phash")
        if phash:
            assets.append(data)
    return assets


def _matches_for_phash(phash: str | None, assets: list[dict], page_image_url: str | None = None) -> list[dict]:
    if not phash:
        return []
    matches = []
    for asset in assets:
        asset_hash = (asset.get("fingerprints") or {}).get("phash")
        if not asset_hash:
            continue
        comparison = compare_phashes(phash, asset_hash)
        if comparison["hamming_distance"] < 15:
            matches.append(
                {
                    "page_image_url": page_image_url,
                    "matched_asset_id": asset.get("asset_id"),
                    "matched_asset_title": asset.get("title"),
                    **comparison,
                }
            )
    return matches


@router.post("/url")
async def detect_url(payload: UrlScanRequest, uid: str = Depends(verify_firebase_token)):
    started = time.perf_counter()
    url = str(payload.url)
    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        response = await client.get(url)
        response.raise_for_status()
        parser = ImageSrcParser()
        parser.feed(response.text)
        image_urls = [urljoin(url, src) for src in parser.srcs][:20]
        analyzed = 0
        matches: list[dict] = []
        assets = _owner_assets(uid)
        for image_url in image_urls:
            try:
                img = await client.get(image_url, timeout=5)
                img.raise_for_status()
                fp = fingerprint_bytes(img.content, img.headers.get("content-type", "image/jpeg"))
                if fp.get("phash"):
                    analyzed += 1
                    matches.extend(_matches_for_phash(fp.get("phash"), assets, image_url))
            except Exception:
                continue
    return {
        "url_scanned": url,
        "images_found": len(image_urls),
        "images_analyzed": analyzed,
        "matches": matches,
        "scan_duration_seconds": round(time.perf_counter() - started, 3),
        "scanned_at": utc_now_iso(),
    }


@router.post("/file")
async def detect_file(file: UploadFile = File(...), uid: str = Depends(verify_firebase_token)):
    started = time.perf_counter()
    fp = await fingerprint_upload(file)
    assets = _owner_assets(uid)
    return {
        "url_scanned": None,
        "images_found": 1 if fp.get("is_image") else 0,
        "images_analyzed": 1 if fp.get("phash") else 0,
        "fingerprint": fp,
        "matches": _matches_for_phash(fp.get("phash"), assets),
        "scan_duration_seconds": round(time.perf_counter() - started, 3),
        "scanned_at": utc_now_iso(),
    }
