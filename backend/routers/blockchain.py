from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel
from web3 import Web3

router = APIRouter(prefix="/api/blockchain", tags=["blockchain"])


class AnchorRequest(BaseModel):
    asset_id: str
    sha256_hash: str
    phash: str | None = None
    owner_uid: str


def _client() -> Web3:
    url = os.getenv("ALCHEMY_SEPOLIA_URL")
    if not url:
        raise RuntimeError("ALCHEMY_SEPOLIA_URL is not configured")
    return Web3(Web3.HTTPProvider(url, request_kwargs={"timeout": 20}))


def _failure(hash_value: str, error: Exception | str) -> dict[str, Any]:
    return {
        "tx_hash": None,
        "block_number": None,
        "block_timestamp": None,
        "gas_used": None,
        "etherscan_url": None,
        "anchored_hash": hash_value,
        "status": "FAILED",
        "error": str(error),
    }


@router.post("/anchor")
async def anchor_to_blockchain(payload: AnchorRequest):
    try:
        private_key = os.getenv("AEGIS_WALLET_PRIVATE_KEY")
        if not private_key:
            raise RuntimeError("AEGIS_WALLET_PRIVATE_KEY is not configured")
        w3 = _client()
        account = w3.eth.account.from_key(private_key)
        tx = {
            "to": account.address,
            "value": 0,
            "data": Web3.to_bytes(hexstr=payload.sha256_hash),
            "nonce": w3.eth.get_transaction_count(account.address),
            "chainId": 11155111,
            "gas": 50000,
            "gasPrice": w3.eth.gas_price,
        }
        signed = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        block = w3.eth.get_block(receipt.blockNumber)
        tx_hex = tx_hash.hex()
        return {
            "tx_hash": tx_hex,
            "block_number": int(receipt.blockNumber),
            "block_timestamp": int(block.timestamp),
            "gas_used": int(receipt.gasUsed),
            "etherscan_url": f"https://sepolia.etherscan.io/tx/{tx_hex}",
            "anchored_hash": payload.sha256_hash,
            "status": "CONFIRMED" if receipt.status == 1 else "FAILED",
        }
    except Exception as exc:
        return _failure(payload.sha256_hash, exc)


@router.get("/verify/{tx_hash}")
async def verify_blockchain(tx_hash: str):
    try:
        w3 = _client()
        tx = w3.eth.get_transaction(tx_hash)
        block = w3.eth.get_block(tx.blockNumber) if tx.blockNumber is not None else None
        input_data = tx.get("input", "")
        anchored_hash = input_data.hex() if isinstance(input_data, bytes) else str(input_data)
        if anchored_hash.startswith("0x"):
            anchored_hash = anchored_hash[2:]
        return {
            "tx_hash": tx_hash,
            "block_number": tx.blockNumber,
            "anchored_hash": anchored_hash,
            "timestamp": int(block.timestamp) if block else None,
            "verified": bool(tx and anchored_hash),
        }
    except Exception as exc:
        return {"tx_hash": tx_hash, "verified": False, "error": str(exc)}
