from __future__ import annotations

import hashlib
import io
import json
import os
from datetime import datetime, timezone
from typing import Any

import firebase_admin
import imagehash
from dotenv import load_dotenv
from fastapi import Header, HTTPException, UploadFile
from firebase_admin import auth, credentials, firestore
from PIL import Image, UnidentifiedImageError

load_dotenv()

VERSION = "2.0.0"
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def initialize_firebase() -> None:
    if firebase_admin._apps:
        return
    service_account = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if not service_account:
        return
    try:
        data = json.loads(service_account)
    except json.JSONDecodeError as exc:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT must be a JSON string") from exc
    firebase_admin.initialize_app(credentials.Certificate(data))


def firestore_client():
    if not firebase_admin._apps:
        raise HTTPException(status_code=503, detail="Firebase Admin SDK is not configured")
    return firestore.client()


async def verify_firebase_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing Firebase bearer token")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing Firebase bearer token")
    try:
        decoded = auth.verify_id_token(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid Firebase token") from exc
    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    return uid


def _hash_to_vector(hex_hash: str) -> list[int]:
    bits = bin(int(str(hex_hash), 16))[2:].zfill(64)[-64:]
    return [int(bit) for bit in bits]


def _image_hashes(raw_bytes: bytes) -> dict[str, Any]:
    image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    phash = str(imagehash.phash(image))
    return {
        "phash": phash,
        "ahash": str(imagehash.average_hash(image)),
        "dhash": str(imagehash.dhash(image)),
        "colorhash": str(imagehash.colorhash(image)),
        "fingerprint_vector": _hash_to_vector(phash),
    }


def fingerprint_bytes(raw_bytes: bytes, mime_type: str | None = None) -> dict[str, Any]:
    sha256 = hashlib.sha256(raw_bytes).hexdigest()
    result: dict[str, Any] = {
        "sha256": sha256,
        "phash": None,
        "ahash": None,
        "dhash": None,
        "colorhash": None,
        "fingerprint_vector": [],
        "timestamp": utc_now_iso(),
        "file_size_bytes": len(raw_bytes),
        "mime_type": mime_type or "application/octet-stream",
        "is_image": False,
    }
    if mime_type and not mime_type.startswith("image/"):
        return result
    try:
        result.update(_image_hashes(raw_bytes))
        result["is_image"] = True
    except (UnidentifiedImageError, OSError, ValueError):
        pass
    return result


async def fingerprint_upload(file: UploadFile) -> dict[str, Any]:
    raw = await file.read()
    return fingerprint_bytes(raw, file.content_type)


def compare_phashes(phash1: str, phash2: str) -> dict[str, Any]:
    try:
        distance = imagehash.hex_to_hash(phash1) - imagehash.hex_to_hash(phash2)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid pHash value") from exc
    similarity = round(((64 - distance) / 64) * 100, 2)
    if distance == 0:
        verdict = "IDENTICAL"
    elif distance <= 10:
        verdict = "NEAR_DUPLICATE"
    elif distance <= 20:
        verdict = "SIMILAR"
    else:
        verdict = "DIFFERENT"
    return {
        "hamming_distance": int(distance),
        "similarity_percent": similarity,
        "verdict": verdict,
        "threshold_used": 10,
    }


def public_fingerprint(result: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in result.items() if key != "is_image"}
