import os
import logging
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional
from collections import defaultdict

from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict
from typing import Literal

# Third-party data / AI libraries
import yfinance as yf
import numpy as np
import pandas as pd
from google import genai
from google.genai import types

from auth import verify_token

# ─── Environment & Logging ────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).parent
# .env dosyasını yükle (Railway'de yoksa sessizce geçer, override=False ile gerçek ayarlar korunur)
load_dotenv(ROOT_DIR / '.env', override=False)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_env_var(name, default=''):
    """Case-insensitive environment variable lookup."""
    return (os.environ.get(name) or os.environ.get(name.lower()) or default).strip()

# ─── Database ─────────────────────────────────────────────────────────────────
mongo_url = get_env_var('MONGO_URL', 'mongodb://localhost:27017')
db_name   = get_env_var('DB_NAME', 'financehub')

client = AsyncIOMotorClient(mongo_url)
db     = client[db_name]

# ─── API Keys ─────────────────────────────────────────────────────────────────
# Mevcut tüm anahtarları logla (güvenlik için değerleri değil sadece isimleri)
all_keys = sorted(list(os.environ.keys()))
logger.info(f"🚀 Railway Service: {os.environ.get('RAILWAY_SERVICE_NAME', 'Unknown')}")
logger.info(f"📋 Available Env Keys: {all_keys}")

# Fuzzy match for debugging
fuzzy_matches = [k for k in all_keys if any(x in k.upper() for x in ['API', 'KEY', 'CORS', 'FIREBASE', 'GOOGLE'])]
logger.info(f"🔍 Fuzzy Matched Keys (API/KEY/CORS/FIREBASE): {fuzzy_matches}")

GOOGLE_API_KEY = get_env_var('GOOGLE_API_KEY')
logger.info(f"🔑 GOOGLE_API_KEY detected: {bool(GOOGLE_API_KEY)}")
if GOOGLE_API_KEY:
    logger.info(f"🔑 Key prefix: {GOOGLE_API_KEY[:4]}...{GOOGLE_API_KEY[-4:]}")

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="FinanceHub API", version="1.0.0")


# ─── CORS Configuration ───────────────────────────────────────────────────────
_raw_origins = get_env_var('CORS_ORIGINS')
_cors_origins = [o.strip() for o in _raw_origins.split(',') if o.strip()] if _raw_origins else []

logger.info(f"🌐 Environment - CORS_ORIGINS: '{_raw_origins}'")
logger.info(f"🌐 Parsed Origins: {_cors_origins}")

# In mock/dev mode OR if no origins configured → allow all (credentials off)
_dev_mode = os.environ.get('AUTH_MODE') == 'mock' or not _cors_origins
logger.info(f"🛠️ Dev Mode: {_dev_mode}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _dev_mode else _cors_origins,
    allow_credentials=False if _dev_mode else True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

# ─── Pydantic Models ──────────────────────────────────────────────────────────
class Account(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    type: str
    balance: float
    created_at: str


class AccountCreate(BaseModel):
    name: str
    type: str
    balance: float = 0.0


class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    type: Literal["income", "expense"]
    amount: float
    category: str
    account_id: str
    account_name: str
    date: str
    note: str = ""
    created_at: str


class TransactionCreate(BaseModel):
    type: Literal["income", "expense"]
    amount: float
    category: str
    account_id: str
    date: str
    note: str = ""


class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    type: Literal["income", "expense", "both"]
    icon: str
    created_at: str


class CategoryCreate(BaseModel):
    name: str
    type: Literal["income", "expense", "both"]
    icon: str = "Tag"


class AIAnalysisRequest(BaseModel):
    symbol: str
    period: str = "1d"   # 15m, 30m, 1h, 4h, 1d, 1wk, 1mo
    language: str = "en"  # tr, en, de …

# ─── Startup ──────────────────────────────────────────────────────────────────
DEFAULT_CATEGORIES = [
    {"id": "cat_1",  "name": "Salary",           "type": "income",  "icon": "Wallet"},
    {"id": "cat_2",  "name": "Freelance",         "type": "income",  "icon": "Briefcase"},
    {"id": "cat_3",  "name": "Investment",        "type": "income",  "icon": "TrendingUp"},
    {"id": "cat_4",  "name": "Food & Dining",     "type": "expense", "icon": "UtensilsCrossed"},
    {"id": "cat_5",  "name": "Transportation",    "type": "expense", "icon": "Car"},
    {"id": "cat_6",  "name": "Shopping",          "type": "expense", "icon": "ShoppingBag"},
    {"id": "cat_7",  "name": "Bills & Utilities", "type": "expense", "icon": "Receipt"},
    {"id": "cat_8",  "name": "Entertainment",     "type": "expense", "icon": "Film"},
    {"id": "cat_9",  "name": "Healthcare",        "type": "expense", "icon": "Heart"},
    {"id": "cat_10", "name": "Education",         "type": "expense", "icon": "GraduationCap"},
]


async def init_default_categories():
    count = await db.categories.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc).isoformat()
        docs = [{**c, "created_at": now} for c in DEFAULT_CATEGORIES]
        await db.categories.insert_many(docs)
        logger.info("✅ Default categories inserted")


@app.on_event("startup")
async def startup():
    try:
        await init_default_categories()
        logger.info("✅ Startup complete")
    except Exception as e:
        logger.error(f"⚠️  Startup warning (DB might be down): {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("MongoDB connection closed")

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "service": "FinanceHub API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

# ─── Account Endpoints ────────────────────────────────────────────────────────
@api_router.post("/accounts", response_model=Account)
async def create_account(account: AccountCreate, user_data: dict = Depends(verify_token)):
    from uuid import uuid4
    user_id     = user_data['uid']
    account_id  = str(uuid4())
    account_dict = {
        **account.model_dump(),
        "id":         account_id,
        "user_id":    user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.accounts.insert_one(account_dict)
    return Account(**account_dict)


@api_router.get("/accounts", response_model=List[Account])
async def get_accounts(user_data: dict = Depends(verify_token)):
    accounts = await db.accounts.find({"user_id": user_data['uid']}, {"_id": 0}).to_list(1000)
    return accounts


@api_router.get("/accounts/{account_id}", response_model=Account)
async def get_account(account_id: str, user_data: dict = Depends(verify_token)):
    account = await db.accounts.find_one({"id": account_id, "user_id": user_data['uid']}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@api_router.put("/accounts/{account_id}", response_model=Account)
async def update_account(account_id: str, account: AccountCreate, user_data: dict = Depends(verify_token)):
    user_id = user_data['uid']
    existing = await db.accounts.find_one({"id": account_id, "user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Account not found")
    await db.accounts.update_one({"id": account_id, "user_id": user_id}, {"$set": account.model_dump()})
    updated = await db.accounts.find_one({"id": account_id}, {"_id": 0})
    return Account(**updated)


@api_router.delete("/accounts/{account_id}")
async def delete_account(account_id: str, user_data: dict = Depends(verify_token)):
    result = await db.accounts.delete_one({"id": account_id, "user_id": user_data['uid']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully"}

# ─── Transaction Endpoints ────────────────────────────────────────────────────
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate, user_data: dict = Depends(verify_token)):
    from uuid import uuid4
    user_id = user_data['uid']

    account = await db.accounts.find_one({"id": transaction.account_id, "user_id": user_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    transaction_id   = str(uuid4())
    transaction_dict = {
        **transaction.model_dump(),
        "id":           transaction_id,
        "user_id":      user_id,
        "account_name": account["name"],
        "created_at":   datetime.now(timezone.utc).isoformat(),
    }

    new_balance = (
        account["balance"] + transaction.amount
        if transaction.type == "income"
        else account["balance"] - transaction.amount
    )
    await db.accounts.update_one(
        {"id": transaction.account_id, "user_id": user_id},
        {"$set": {"balance": new_balance}}
    )
    await db.transactions.insert_one(transaction_dict)
    return Transaction(**transaction_dict)


@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    account_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date:   Optional[str] = None,
    user_data:  dict = Depends(verify_token)
):
    user_id = user_data['uid']
    query: dict = {"user_id": user_id}

    if account_id:
        query["account_id"] = account_id
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["date"] = {"$gte": start_date}
    elif end_date:
        query["date"] = {"$lte": end_date}

    transactions = await db.transactions.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return transactions


@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, user_data: dict = Depends(verify_token)):
    user_id     = user_data['uid']
    transaction = await db.transactions.find_one({"id": transaction_id, "user_id": user_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    account = await db.accounts.find_one({"id": transaction["account_id"], "user_id": user_id}, {"_id": 0})
    if account:
        new_balance = (
            account["balance"] - transaction["amount"]
            if transaction["type"] == "income"
            else account["balance"] + transaction["amount"]
        )
        await db.accounts.update_one({"id": transaction["account_id"]}, {"$set": {"balance": new_balance}})

    await db.transactions.delete_one({"id": transaction_id})
    return {"message": "Transaction deleted successfully"}

# ─── Category Endpoints ───────────────────────────────────────────────────────
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    return await db.categories.find({}, {"_id": 0}).to_list(1000)


@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate):
    from uuid import uuid4
    category_dict = {
        **category.model_dump(),
        "id":         str(uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.categories.insert_one(category_dict)
    return Category(**category_dict)

# ─── Dashboard Stats ──────────────────────────────────────────────────────────
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user_data: dict = Depends(verify_token)):
    user_id = user_data['uid']
    try:
        accounts     = await db.accounts.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
        transactions = await db.transactions.find({"user_id": user_id}, {"_id": 0}).to_list(10000)
    except Exception as e:
        logger.error(f"Dashboard DB error (returning empty stats): {e}")
        return {
            "total_balance": 0.0,
            "total_income": 0.0,
            "total_expense": 0.0,
            "expenses_by_category": [],
            "balance_history": [],
        }

    total_balance  = sum(a["balance"] for a in accounts)
    total_income   = sum(t["amount"] for t in transactions if t["type"] == "income")
    total_expense  = sum(t["amount"] for t in transactions if t["type"] == "expense")

    category_expenses: dict = {}
    for t in transactions:
        if t["type"] == "expense":
            category_expenses[t["category"]] = category_expenses.get(t["category"], 0) + t["amount"]

    expenses_by_category = [{"category": k, "amount": v} for k, v in category_expenses.items()]

    balance_by_date: dict = defaultdict(float)
    running = 0.0
    for t in sorted(transactions, key=lambda x: x["date"]):
        running += t["amount"] if t["type"] == "income" else -t["amount"]
        balance_by_date[t["date"]] = running

    balance_history = [{"date": k, "balance": v} for k, v in sorted(balance_by_date.items())]

    return {
        "total_balance":        total_balance,
        "total_income":         total_income,
        "total_expense":        total_expense,
        "expenses_by_category": expenses_by_category,
        "balance_history":      balance_history[-30:],
    }

# ─── AI Analysis ──────────────────────────────────────────────────────────────
CRYPTO_LIST = {
    "BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "AVAX", "DOGE", "DOT", "MATIC", "LINK", "UNI",
    "ATOM", "LTC", "BCH", "NEAR", "APT", "ARB", "OP", "SUI", "TIA", "INJ", "SEI", "FTM",
    "ALGO", "VET", "ICP", "HBAR", "FIL", "AAVE", "MKR", "GRT", "SAND", "MANA", "AXS", "THETA",
    "XLM", "XMR", "EOS", "SHIB", "PEPE", "WIF", "BONK", "FLOKI", "GALA", "CHZ", "ENJ", "ROSE",
    "RUNE", "KAVA",
}

BIST_STOCKS = {
    "THYAO", "EREGL", "ASELS", "GARAN", "ISCTR", "AKBNK", "YKBNK", "KCHOL", "SAHOL", "TCELL", 
    "TUPRS", "BIMAS", "SISE", "ENKAI", "PGSUS", "FROTO", "TOASO", "PETKM", "HEKTS", "SASA",
}

INTERVAL_MAP = {
    "15m": ("15m", "5d"),
    "30m": ("30m", "5d"),
    "1h":  ("1h",  "5d"),
    "4h":  ("1h",  "1mo"),
    "1d":  ("1d",  "1mo"),
    "1wk": ("1wk", "1y"),
    "1mo": ("1mo", "2y"),
}


def clean_float(val):
    if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
        return None
    return val


@api_router.post("/ai-analysis")
async def get_ai_analysis(request: AIAnalysisRequest, user_data: dict = Depends(verify_token)):
    symbol = request.symbol.upper().strip()
    period = request.period
    lang   = request.language

    # Auto-append -USD for known crypto tickers
    if symbol in CRYPTO_LIST:
        symbol = f"{symbol}-USD"
        
    # Auto-append .IS for BIST stocks
    if symbol in BIST_STOCKS:
        symbol = f"{symbol}.IS"

    # ── 1. Fetch Market Data ──────────────────────────────────────────────────
    yf_interval, yf_period = INTERVAL_MAP.get(period, ("1d", "1mo"))

    def fetch(sym: str):
        try:
            h = yf.Ticker(sym).history(period=yf_period, interval=yf_interval)
            logger.info(f"Fetched {len(h)} rows for {sym}")
            return h, sym
        except Exception as exc:
            logger.error(f"yfinance error for {sym}: {exc}")
            return pd.DataFrame(), sym

    history, final_symbol = fetch(symbol)

    # Fallback: try -USD suffix for unknown cryptos
    if history.empty and "-" not in symbol:
        alt = f"{symbol}-USD"
        logger.info(f"Primary empty, trying {alt}")
        history, alt_sym = fetch(alt)
        if not history.empty:
            final_symbol = alt_sym

    if history.empty:
        raise HTTPException(status_code=404, detail=f"No data found for '{symbol}'. Check the symbol and try again.")

    symbol = final_symbol

    # ── 2. Technical Indicators ───────────────────────────────────────────────
    delta = history['Close'].diff()
    gain  = delta.where(delta > 0, 0).rolling(14).mean()
    loss  = (-delta.where(delta < 0, 0)).rolling(14).mean()
    rs    = gain / loss.replace(0, float('nan'))
    history['RSI']   = 100 - (100 / (1 + rs))
    history['SMA_20'] = history['Close'].rolling(20).mean()
    history['SMA_50'] = history['Close'].rolling(50).mean()

    current_price = float(history['Close'].iloc[-1])
    open_price    = float(history['Open'].iloc[-1])
    change_24h    = ((current_price - open_price) / open_price * 100) if open_price else 0.0
    if np.isnan(change_24h):
        change_24h = 0.0

    rsi_val    = float(history['RSI'].iloc[-1])   if not np.isnan(history['RSI'].iloc[-1])    else 50.0
    sma_20_val = float(history['SMA_20'].iloc[-1]) if not np.isnan(history['SMA_20'].iloc[-1]) else current_price

    logger.info(f"Indicators — Price: {current_price:.4f}, RSI: {rsi_val:.2f}")

    # ── 3. Gemini AI Analysis ─────────────────────────────────────────────────
    api_key = GOOGLE_API_KEY

    sentiment          = "Neutral"
    confidence         = 50
    analysis_text      = ""
    signal_data        = {}
    support_levels     = []
    resistance_levels  = []

    if not api_key:
        logger.warning("GOOGLE_API_KEY not set — skipping AI analysis")
        analysis_text = "<p>AI analysis unavailable: API key not configured.</p>"
    else:
        try:
            client_ai = genai.Client(api_key=api_key)
            
            prompt = f"""
You are an elite Wall Street Quant & Technical Analyst with 20 years of experience.
Perform a DEEP DIVE analysis on {symbol} ({period}).
Language: {lang}.

Market Data:
- Current Price: ${current_price:.4f}
- RSI(14): {rsi_val:.2f}
- SMA(20): ${sma_20_val:.4f}

Your Mission:
1. Analyze Market Structure (Trends, Liquidity Zones, Order Blocks).
2. Identify Institutional Activity (Whale movements, Volume anomalies).
3. Provide a clear, actionable Trading Strategy with SPECIFIC PRICE LEVELS.

RESPONSE FORMAT (JSON ONLY — no markdown, no text outside JSON):
{{
    "sentiment": "Bullish",
    "confidence": 85,
    "signal": {{
        "entry_price": {current_price:.4f},
        "stop_loss": {current_price * 0.97:.4f},
        "take_profit_1": {current_price * 1.03:.4f},
        "take_profit_2": {current_price * 1.06:.4f}
    }},
    "support_levels": [{current_price * 0.95:.4f}, {current_price * 0.92:.4f}, {current_price * 0.88:.4f}],
    "resistance_levels": [{current_price * 1.05:.4f}, {current_price * 1.08:.4f}, {current_price * 1.12:.4f}],
    "analysis_html": "<p><b>Market Structure:</b> ...</p><p><b>Whale Watch:</b> ...</p><p><b>Verdict:</b> ...</p>"
}}

RULES:
- ALL price values must be plain NUMBERS (no $ symbols, no strings)
- Support levels BELOW current price, resistance levels ABOVE
- DO NOT leave any field empty
"""
            response = client_ai.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            raw_text = response.text.strip()

            try:
                ai_data           = json.loads(raw_text)
                sentiment         = ai_data.get("sentiment", "Neutral")
                confidence        = ai_data.get("confidence", 50)
                analysis_text     = ai_data.get("analysis_html", "")
                signal_data       = ai_data.get("signal", {})
                support_levels    = ai_data.get("support_levels", [])
                resistance_levels = ai_data.get("resistance_levels", [])

                if not analysis_text:
                    analysis_text = f"<p><b>{symbol} Analysis</b></p><p>Current price: ${current_price:.4f}</p>"

                # Strip stray $ signs from signal strings
                for key in ("entry_price", "stop_loss", "take_profit_1", "take_profit_2"):
                    if key in signal_data and isinstance(signal_data[key], str):
                        signal_data[key] = signal_data[key].replace('$', '').strip()

            except Exception as parse_err:
                logger.error(f"JSON parse error: {parse_err} — raw: {raw_text[:300]}")
                analysis_text = f"<p>Analysis parse error. Raw: {raw_text[:200]}</p>"

        except Exception as ai_err:
            logger.error(f"Gemini error: {ai_err}")
            analysis_text = f"<p>AI error: {str(ai_err)}</p>"

    # Ensure signal always has values
    if not signal_data or not signal_data.get("entry_price"):
        signal_data = {
            "entry_price":   round(current_price, 4),
            "stop_loss":     round(current_price * 0.97, 4),
            "take_profit_1": round(current_price * 1.03, 4),
            "take_profit_2": round(current_price * 1.06, 4),
        }
    if not support_levels:
        support_levels    = [round(current_price * m, 4) for m in (0.95, 0.92, 0.90)]
    if not resistance_levels:
        resistance_levels = [round(current_price * m, 4) for m in (1.05, 1.08, 1.12)]

    return {
        "symbol":            symbol,
        "price":             clean_float(current_price),
        "change_24h":        clean_float(round(change_24h, 2)),
        "sentiment":         sentiment,
        "confidence":        confidence,
        "analysis":          analysis_text,
        "signal":            signal_data,
        "support_levels":    [clean_float(x) for x in support_levels],
        "resistance_levels": [clean_float(x) for x in resistance_levels],
        "timestamp":         datetime.now(timezone.utc).isoformat(),
    }

# ─── Register Router ──────────────────────────────────────────────────────────
app.include_router(api_router)