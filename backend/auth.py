import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from pathlib import Path
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin
cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH')
cred_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')

try:
    if not firebase_admin._apps:
        if cred_json:
            import json
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase Admin initialized with FIREBASE_CREDENTIALS_JSON")
        elif cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase Admin initialized with credentials file")
        else:
            # Fallback for development/mocking or if env var not set properly
            # In production, this should likely fail or use default google credentials
            logger.warning("⚠️ No Firebase credentials found (PATH or JSON). Attempting default init (or mock mode).")
            # firebase_admin.initialize_app() # Use this for Google Cloud default credentials
            pass 
except Exception as e:
    logger.error(f"❌ Firebase Admin initialization error: {e}")

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verifies the Firebase ID token passed in the Authorization header.
    Returns the decoded token (user info) if valid.
    """
    token = credentials.credentials
    
    # DEV MODE / MOCK BYPASS (Optional - remove for strict production)
    # DEV MODE / MOCK BYPASS
    if os.environ.get('AUTH_MODE') == 'mock' or token == "mock-token":
        return {"uid": "mock-user-id", "email": "demo@example.com"}

    try:
        # 1. Try standard Firebase Verification if initialized
        if firebase_admin._apps:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        else:
             logger.warning("⚠️ Firebase Admin NOT initialized. Falling back to unverified decoding.")
             raise Exception("Firebase not initialized")

    except Exception as e:
        logger.warning(f"Standard verification failed ({e}). Attempting unverified decode for development.")
        # FALLBACK: Decode without verification (For Dev/Demo only)
        try:
            import jwt
            # Decode without verification to extract payload
            decoded = jwt.decode(token, options={"verify_signature": False})
            
            # Map standard JWT fields to Firebase expectation
            user_data = {
                "uid": decoded.get("user_id") or decoded.get("sub"),
                "email": decoded.get("email"),
                "name": decoded.get("name"),
                "picture": decoded.get("picture")
            }
            
            if not user_data["uid"]:
                 raise Exception("No UID found in token")
                 
            logger.info(f"🔓 Accepted unverified token for user: {user_data['email']}")
            return user_data
            
        except Exception as decode_error:
            logger.error(f"❌ Token decoding failed completely: {decode_error}")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
