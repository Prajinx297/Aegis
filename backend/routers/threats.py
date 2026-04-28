from __future__ import annotations

import json
import os
from typing import Any

import httpx
from anthropic import Anthropic
from fastapi import APIRouter
from pydantic import BaseModel

from core import ANTHROPIC_MODEL, utc_now_iso

router = APIRouter(prefix="/api/threats", tags=["threats"])


class ThreatRequest(BaseModel):
    log_entry: str


def _anthropic() -> Anthropic:
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")
    return Anthropic(api_key=key)


@router.post("/classify")
async def classify_threat(payload: ThreatRequest):
    system = (
        "You are a cybersecurity threat classifier. Analyze the log entry and return "
        "ONLY a JSON object with: threat_type (string from: IP_SCRAPER | CONTENT_BOT | "
        "DEEPFAKE_GENERATOR | UNAUTHORIZED_API | PROXY_CRAWLER | DMCA_EVADER | "
        "ADVERSARIAL_PROBE | BENIGN), severity (CRITICAL|HIGH|MEDIUM|LOW), "
        "confidence (float 0-1), reasoning (string, max 30 words), "
        "recommended_action (BLOCK|MONITOR|IGNORE)"
    )
    response = _anthropic().messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=700,
        temperature=0.1,
        system=system,
        messages=[{"role": "user", "content": payload.log_entry}],
    )
    raw = "".join(block.text for block in response.content if getattr(block, "type", "") == "text").strip()
    try:
        parsed: dict[str, Any] = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {
            "threat_type": "BENIGN",
            "severity": "LOW",
            "confidence": 0.0,
            "reasoning": "Claude returned non-JSON output.",
            "recommended_action": "MONITOR",
            "raw_response": raw,
        }
    parsed["log_entry"] = payload.log_entry
    parsed["timestamp"] = utc_now_iso()
    parsed["model_used"] = ANTHROPIC_MODEL
    return parsed


@router.get("/ip-intel/{ip_address}")
async def ip_intel(ip_address: str):
    url = f"http://ip-api.com/json/{ip_address}?fields=status,country,countryCode,city,isp,org,proxy,hosting"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url)
            response.raise_for_status()
        data = response.json()
        if data.get("status") != "success":
            return {"status": "unknown"}
        return {
            "status": "success",
            "country": data.get("country"),
            "countryCode": data.get("countryCode"),
            "city": data.get("city"),
            "isp": data.get("isp"),
            "org": data.get("org"),
            "is_proxy": bool(data.get("proxy")),
            "is_hosting": bool(data.get("hosting")),
        }
    except Exception:
        return {"status": "unknown"}
