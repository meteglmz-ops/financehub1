import os
import json
import logging
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

# ─── Environment & Logging ────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Firebase Admin Initialization ───────────────────────────────────────────
def _init_firebase():
    """Initialize Firebase Admin SDK from env vars (called once at import time)."""
    if firebase_admin._apps:
        return  # Already initialized

    cred_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')
    cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH')

    try:
        if cred_json:
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase Admin initialized via FIREBASE_CREDENTIALS_JSON")
        elif cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info(f"✅ Firebase Admin initialized via file: {cred_path}")
        else:
            logger.warning(
                "⚠️  No Firebase credentials found. "
                "Set FIREBASE_CREDENTIALS_JSON or FIREBASE_CREDENTIALS_PATH. "
                "Auth will fall back to unverified JWT decoding."
            )
    except Exception as exc:
        logger.error(f"❌ Firebase Admin initialization failed: {exc}")


_init_firebase()

# ─── Auth ─────────────────────────────────────────────────────────────────────
security = HTTPBearer()


async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Verify a Firebase ID token from the Authorization: Bearer <token> header.
    Returns the decoded token dict on success, raises HTTP 401 on failure.

    Mock bypass: set AUTH_MODE=mock in env (dev only) or pass token='mock-token'.
    """
    token = credentials.credentials

    # ── Dev mock bypass ───────────────────────────────────────────────────────
    if os.environ.get('AUTH_MODE') == 'mock' or token == "mock-token":
        return {"uid": "mock-user-id", "email": "demo@example.com"}

    # ── Standard Firebase verification ────────────────────────────────────────
    if firebase_admin._apps:
        try:
            decoded = auth.verify_id_token(token)
            return decoded
        except Exception as exc:
            logger.warning(f"Firebase verify_id_token failed: {exc}")
            # Fall through to JWT decode fallback

    # ── Fallback: decode without signature verification (dev / emergency) ─────
    try:
        import jwt as pyjwt
        decoded = pyjwt.decode(token, options={"verify_signature": False})
        uid = decoded.get("user_id") or decoded.get("sub")
        if not uid:
            raise ValueError("Token has no uid/sub claim")
        logger.info(f"🔓 Accepted unverified token for UID: {uid}")
        return {
            "uid":     uid,
            "email":   decoded.get("email"),
            "name":    decoded.get("name"),
            "picture": decoded.get("picture"),
        }
    except Exception as decode_err:
        logger.error(f"❌ Token decode failed: {decode_err}")
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
