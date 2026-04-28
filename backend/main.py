from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from core import VERSION, cors_origins, initialize_firebase
from routers import assets, blockchain, detection, dmca, fingerprint, threats

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(
    title="AEGIS v2 API",
    version=VERSION,
    description="Production IP Protection and Cyber Threat Intelligence API",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    initialize_firebase()


@app.get("/health")
@limiter.limit("60/minute")
async def health(request: Request) -> dict[str, str]:
    return {"status": "ok", "version": VERSION}


app.include_router(fingerprint.router)
app.include_router(blockchain.router)
app.include_router(dmca.router)
app.include_router(threats.router)
app.include_router(assets.router)
app.include_router(detection.router)
