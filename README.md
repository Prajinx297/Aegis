# AEGIS v2

![Python 3.11](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)
![React 18](https://img.shields.io/badge/React-18-61dafb)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.17-orange)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-yellow)
![Ethereum Sepolia](https://img.shields.io/badge/Ethereum-Sepolia-purple)
![Claude AI](https://img.shields.io/badge/Claude-claude--sonnet--4--5-black)

AEGIS v2 is a production-grade IP Protection + Cyber Threat Intelligence platform for hackathon judging. It is structured as a monorepo with a FastAPI backend, React/Vite frontend, and an ML notes area.

## What's Actually Real

- Real SHA-256 + perceptual hash computation using SubtleCrypto and Canvas API in the browser, plus Pillow/imagehash on the backend.
- Real TensorFlow.js inference using MobileNet V2 and BlazeFace face detection.
- Real FGSM-style adversarial perturbation via TensorFlow.js tensor operations.
- Real Claude API calls for DMCA generation, threat classification, and URL risk analysis.
- Real Ethereum Sepolia blockchain anchoring via Alchemy and web3.py.
- Real Firebase Authentication with Google OAuth and email/password.
- Real Firestore persistence for assets, watchlists, cached threat classifications, analytics, and DMCA cases.
- Real IP geolocation and proxy/hosting enrichment via ip-api.com.
- Simulated or seed data is labeled in the UI as `SIMULATED` or `Illustrative`.

## Architecture

```text
/aegis
  /backend  FastAPI routers
     fingerprint -> SHA-256 + imagehash
     blockchain  -> Sepolia transaction data anchoring
     dmca        -> Claude legal notice + URL risk analysis
     threats     -> Claude classifier + ip-api enrichment
     assets      -> Firebase protected Firestore registry
     detection   -> URL/file pHash matching
  /frontend React 18 + Vite + TypeScript
     Firebase Auth -> axios bearer token -> FastAPI
     Canvas pHash + SubtleCrypto
     TensorFlow.js MobileNet + BlazeFace
     Recharts + Firestore analytics
  /ml       model export notes
```

## Local Setup

1. Create backend env:

```bash
cd backend
cp .env.example .env
```

2. Fill `backend/.env`:

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude API key for DMCA, threat, and URL analysis |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON string |
| `ALCHEMY_SEPOLIA_URL` | Sepolia RPC URL from Alchemy |
| `AEGIS_WALLET_PRIVATE_KEY` | Funded Sepolia test wallet private key |
| `CORS_ORIGINS` | Comma-separated frontend origins |

3. Start backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

4. Create frontend env:

```bash
cd frontend
cp .env.example .env
```

5. Fill frontend env:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | FastAPI base URL |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |

6. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

7. Full stack with Docker:

```bash
docker-compose up --build
```

## API Endpoints

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/health` | Service health and version | No |
| `POST` | `/api/fingerprint` | Upload file and compute real hashes | No |
| `POST` | `/api/fingerprint/compare` | Compare pHash Hamming distance | No |
| `POST` | `/api/blockchain/anchor` | Anchor SHA-256 to Sepolia transaction data | No |
| `GET` | `/api/blockchain/verify/{tx_hash}` | Verify transaction input hash | No |
| `POST` | `/api/dmca/generate` | Generate Claude DMCA notice | No |
| `POST` | `/api/dmca/analyze-url` | Fetch URL and Claude risk analysis | No |
| `POST` | `/api/threats/classify` | Claude threat classifier | No |
| `GET` | `/api/threats/ip-intel/{ip}` | ip-api geolocation and proxy/hosting data | No |
| `POST` | `/api/assets` | Register Firestore asset and image blockchain anchor | Firebase |
| `GET` | `/api/assets` | List current user's assets | Firebase |
| `GET` | `/api/assets/{asset_id}` | Fetch owned asset | Firebase |
| `DELETE` | `/api/assets/{asset_id}` | Delete owned asset | Firebase |
| `POST` | `/api/detect/url` | Fetch page images and compare to owned assets | Firebase |
| `POST` | `/api/detect/file` | Compare uploaded file to owned assets | Firebase |

## Deployment

- Backend: deploy `backend/Dockerfile` on Railway. Set all backend env vars in Railway.
- Frontend: deploy `frontend/` on Vercel. Set `VITE_API_URL` and Firebase web env vars in Vercel.
- Blockchain: fund the configured wallet with Sepolia ETH from a faucet.

## Honesty Notes

The deepfake detector is labeled `Heuristic Analysis (Experimental)` because it combines real BlazeFace detection, MobileNet predictions, Laplacian edge energy, and landmark asymmetry. It is not presented as a trained forensic classifier.
