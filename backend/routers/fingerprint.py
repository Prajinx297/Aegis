from __future__ import annotations

from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel

from core import compare_phashes, fingerprint_upload, public_fingerprint

router = APIRouter(prefix="/api/fingerprint", tags=["fingerprint"])


class CompareRequest(BaseModel):
    phash1: str
    phash2: str


@router.post("")
async def create_fingerprint(file: UploadFile = File(...)):
    result = await fingerprint_upload(file)
    return public_fingerprint(result)


@router.post("/compare")
async def compare_fingerprints(payload: CompareRequest):
    return compare_phashes(payload.phash1, payload.phash2)
