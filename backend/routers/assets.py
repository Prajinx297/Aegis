from __future__ import annotations

import json
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from firebase_admin import firestore

from core import fingerprint_upload, firestore_client, public_fingerprint, verify_firebase_token
from routers.blockchain import AnchorRequest, anchor_to_blockchain

router = APIRouter(prefix="/api/assets", tags=["assets"])


def _parse_tags(tags: str) -> list[str]:
    try:
        parsed = json.loads(tags)
        if isinstance(parsed, list):
            return [str(tag).strip() for tag in parsed if str(tag).strip()]
    except json.JSONDecodeError:
        pass
    return [tag.strip() for tag in tags.split(",") if tag.strip()]


def _doc_to_dict(doc) -> dict:
    data = doc.to_dict() or {}
    data.setdefault("asset_id", doc.id)
    return data


@router.post("")
async def register_asset(
    file: UploadFile = File(...),
    title: str = Form(...),
    asset_type: str = Form(...),
    license: str = Form(...),
    tags: str = Form(default=""),
    uid: str = Depends(verify_firebase_token),
):
    fingerprint = await fingerprint_upload(file)
    asset_id = str(uuid4())
    blockchain = None
    if fingerprint.get("is_image"):
        chain = await anchor_to_blockchain(
            AnchorRequest(
                asset_id=asset_id,
                sha256_hash=fingerprint["sha256"],
                phash=fingerprint.get("phash"),
                owner_uid=uid,
            )
        )
        if chain.get("status") == "CONFIRMED":
            blockchain = {
                "tx_hash": chain.get("tx_hash"),
                "block_number": chain.get("block_number"),
                "etherscan_url": chain.get("etherscan_url"),
                "gas_used": chain.get("gas_used"),
            }
        else:
            blockchain = {"status": "FAILED", "error": chain.get("error")}
    doc = {
        "asset_id": asset_id,
        "owner_uid": uid,
        "title": title,
        "asset_type": asset_type,
        "license": license,
        "tags": _parse_tags(tags),
        "fingerprints": {
            "sha256": fingerprint.get("sha256"),
            "phash": fingerprint.get("phash"),
            "ahash": fingerprint.get("ahash"),
            "dhash": fingerprint.get("dhash"),
            "colorhash": fingerprint.get("colorhash"),
        },
        "metadata": public_fingerprint(fingerprint),
        "blockchain": blockchain,
        "registered_at": firestore.SERVER_TIMESTAMP,
        "status": "PROTECTED",
    }
    db = firestore_client()
    db.collection("assets").document(asset_id).set(doc)
    saved = db.collection("assets").document(asset_id).get().to_dict() or doc
    saved["asset_id"] = asset_id
    return saved


@router.get("")
async def list_assets(uid: str = Depends(verify_firebase_token)):
    db = firestore_client()
    docs = db.collection("assets").where("owner_uid", "==", uid).stream()
    assets = [_doc_to_dict(doc) for doc in docs]
    assets.sort(key=lambda item: str(item.get("registered_at", "")), reverse=True)
    return assets


@router.get("/{asset_id}")
async def get_asset(asset_id: str, uid: str = Depends(verify_firebase_token)):
    doc = firestore_client().collection("assets").document(asset_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Asset not found")
    data = _doc_to_dict(doc)
    if data.get("owner_uid") != uid:
        raise HTTPException(status_code=403, detail="Not allowed")
    return data


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, uid: str = Depends(verify_firebase_token)):
    await get_asset(asset_id, uid)
    firestore_client().collection("assets").document(asset_id).delete()
    return {"deleted": True}
