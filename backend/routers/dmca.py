from __future__ import annotations

import json
import os
import re
import secrets
import string
from datetime import datetime, timezone
from typing import Any

import httpx
from anthropic import Anthropic
from fastapi import APIRouter
from pydantic import BaseModel, HttpUrl

from core import ANTHROPIC_MODEL, utc_now_iso

router = APIRouter(prefix="/api/dmca", tags=["dmca"])


class DmcaRequest(BaseModel):
    owner_name: str
    asset_title: str
    asset_description: str
    asset_registration_date: str
    infringing_url: str
    platform: str
    infringement_type: str
    additional_evidence: str = ""


class AnalyzeUrlRequest(BaseModel):
    url: HttpUrl


def _anthropic() -> Anthropic:
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")
    return Anthropic(api_key=key)


def _message(system: str, user: str, max_tokens: int = 1600) -> str:
    response = _anthropic().messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=max_tokens,
        temperature=0.2,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return "".join(block.text for block in response.content if getattr(block, "type", "") == "text").strip()


def _case_id() -> str:
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(6))
    return f"AEGIS-DMCA-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{suffix}"


@router.post("/generate")
async def generate_dmca(payload: DmcaRequest):
    system = (
        "You are a legal document specialist. Generate a formal DMCA Section 512(c) "
        "takedown notice. Output ONLY the notice text in professional legal format. "
        "Include: proper header, identification of copyrighted work, identification "
        "of infringing material, contact information placeholders in [BRACKETS], "
        "good faith statement, accuracy statement, and signature block. Do NOT "
        "include any preamble or explanation."
    )
    user = json.dumps(payload.model_dump(), indent=2)
    notice = _message(system, user)
    return {
        "notice_text": notice,
        "word_count": len(re.findall(r"\b\w+\b", notice)),
        "generated_at": utc_now_iso(),
        "model_used": ANTHROPIC_MODEL,
        "case_id": _case_id(),
    }


@router.post("/analyze-url")
async def analyze_url(payload: AnalyzeUrlRequest):
    fetched_url = str(payload.url)
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            response = await client.get(fetched_url)
            response.raise_for_status()
        html = response.text[:8000]
    except Exception:
        return {
            "risk_score": 0,
            "risk_level": "UNKNOWN",
            "indicators": [],
            "detected_content_types": [],
            "recommendation": "The URL could not be reached for analysis.",
            "fetched_url": fetched_url,
            "timestamp": utc_now_iso(),
        }
    system = (
        "You are an IP infringement analyst. Analyze this webpage HTML for potential "
        "copyright infringement indicators. Return ONLY a JSON object with these fields: "
        "risk_score (0-100 integer), risk_level (LOW/MEDIUM/HIGH/CRITICAL), "
        "indicators (array of strings describing specific infringement signals found), "
        "detected_content_types (array: images/videos/text/audio), "
        "recommendation (1 sentence string)"
    )
    raw = _message(system, html, max_tokens=1000)
    try:
        parsed: dict[str, Any] = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {
            "risk_score": 0,
            "risk_level": "UNKNOWN",
            "indicators": ["Claude returned non-JSON output; raw response retained."],
            "detected_content_types": [],
            "recommendation": "Retry analysis or inspect the page manually.",
            "raw_response": raw,
        }
    parsed["fetched_url"] = fetched_url
    parsed["timestamp"] = utc_now_iso()
    return parsed
