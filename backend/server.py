from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone
from decimal import Decimal
from auth import verify_token
import firebase_admin
from firebase_admin import credentials

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()

# Initialize Firebase (Try env var or default) - Handled mostly by auth.py import, but explicit check here too
try:
    if not firebase_admin._apps:
        cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH')
        cred_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')
        
        if cred_json:
            import json
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        elif cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
except Exception as e:
    logging.warning(f"Firebase Init Warning in server.py: {e}")

api_router = APIRouter(prefix="/api")

# Models
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

# Initialize default categories
async def init_default_categories():
    count = await db.categories.count_documents({})
    if count == 0:
        default_categories = [
            {"id": "cat_1", "name": "Salary", "type": "income", "icon": "Wallet", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "cat_2", "name": "Freelance", "type": "income", "icon": "Briefcase", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "cat_3", "name": "Investment", "type": "income", "icon": "TrendingUp", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "cat_4", "name": "Food & Dining", "type": "expense", "icon": "UtensilsCrossed", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "cat_5", "name": "Transportation", "type": "expense", "icon": "Car", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "cat_6", "name": "Shopping", "type": "expense", "icon": "ShoppingBag", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "cat_7", "name": "Bills & Utilities", "type": "expense", "icon": "Receipt", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "cat_8", "name": "Entertainment", "type": "expense", "icon": "Film", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "cat_9", "name": "Healthcare", "type": "expense", "icon": "Heart", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "cat_10", "name": "Education", "type": "expense", "icon": "GraduationCap", "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.categories.insert_many(default_categories)

@app.on_event("startup")
async def startup():
    try:
        await init_default_categories()
    except Exception as e:
        logger.error(f"Startup Warning: Could not initialize categories (Database might be down): {e}")

# Account endpoints
@api_router.post("/accounts", response_model=Account)
async def create_account(account: AccountCreate, user_data: dict = Depends(verify_token)):
    from uuid import uuid4
    user_id = user_data['uid']
    account_id = str(uuid4())
    account_dict = account.model_dump()
    account_dict["id"] = account_id
    account_dict["user_id"] = user_id
    account_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.accounts.insert_one(account_dict)
    return Account(**account_dict)

@api_router.get("/accounts", response_model=List[Account])
async def get_accounts(user_data: dict = Depends(verify_token)):
    user_id = user_data['uid']
    accounts = await db.accounts.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return accounts

@api_router.get("/accounts/{account_id}", response_model=Account)
async def get_account(account_id: str, user_data: dict = Depends(verify_token)):
    user_id = user_data['uid']
    account = await db.accounts.find_one({"id": account_id, "user_id": user_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@api_router.put("/accounts/{account_id}", response_model=Account)
async def update_account(account_id: str, account: AccountCreate, user_data: dict = Depends(verify_token)):
    user_id = user_data['uid']
    existing = await db.accounts.find_one({"id": account_id, "user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_dict = account.model_dump()
    await db.accounts.update_one({"id": account_id, "user_id": user_id}, {"$set": update_dict})
    
    updated = await db.accounts.find_one({"id": account_id}, {"_id": 0})
    return Account(**updated)

@api_router.delete("/accounts/{account_id}")
async def delete_account(account_id: str, user_data: dict = Depends(verify_token)):
    user_id = user_data['uid']
    result = await db.accounts.delete_one({"id": account_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully"}

# Transaction endpoints
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate, user_data: dict = Depends(verify_token)):
    from uuid import uuid4
    user_id = user_data['uid']
    
    account = await db.accounts.find_one({"id": transaction.account_id, "user_id": user_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    transaction_id = str(uuid4())
    transaction_dict = transaction.model_dump()
    transaction_dict["id"] = transaction_id
    transaction_dict["user_id"] = user_id
    transaction_dict["account_name"] = account["name"]
    transaction_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update account balance
    if transaction.type == "income":
        new_balance = account["balance"] + transaction.amount
    else:
        new_balance = account["balance"] - transaction.amount
    
    await db.accounts.update_one({"id": transaction.account_id, "user_id": user_id}, {"$set": {"balance": new_balance}})
    await db.transactions.insert_one(transaction_dict)
    
    return Transaction(**transaction_dict)

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    account_id: Optional[str] = None, 
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None,
    user_data: dict = Depends(verify_token)
):
    user_id = user_data['uid']
    query = {"user_id": user_id}
    if account_id:
        query["account_id"] = account_id
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query and isinstance(query["date"], dict):
            query["date"]["$lte"] = end_date
        elif "date" in query: # if it was a direct equality match (unlikely here but for safety)
            query["date"] = {"$gte": query["date"], "$lte": end_date}
        else:
            query["date"] = {"$lte": end_date}
    
    transactions = await db.transactions.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return transactions

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, user_data: dict = Depends(verify_token)):
    user_id = user_data['uid']
    transaction = await db.transactions.find_one({"id": transaction_id, "user_id": user_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    account = await db.accounts.find_one({"id": transaction["account_id"], "user_id": user_id}, {"_id": 0})
    if account:
        if transaction["type"] == "income":
            new_balance = account["balance"] - transaction["amount"]
        else:
            new_balance = account["balance"] + transaction["amount"]
        await db.accounts.update_one({"id": transaction["account_id"]}, {"$set": {"balance": new_balance}})
    
    await db.transactions.delete_one({"id": transaction_id})
    return {"message": "Transaction deleted successfully"}

# Category endpoints
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate):
    from uuid import uuid4
    category_id = str(uuid4())
    category_dict = category.model_dump()
    category_dict["id"] = category_id
    category_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.categories.insert_one(category_dict)
    return Category(**category_dict)

# Dashboard stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user_data: dict = Depends(verify_token)):
    user_id = user_data['uid']
    accounts = await db.accounts.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    transactions = await db.transactions.find({"user_id": user_id}, {"_id": 0}).to_list(10000)
    
    total_balance = sum(acc["balance"] for acc in accounts)
    
    total_income = sum(t["amount"] for t in transactions if t["type"] == "income")
    total_expense = sum(t["amount"] for t in transactions if t["type"] == "expense")
    
    # Expenses by category
    # Expenses by category
    category_expenses = {}
    if transactions:
        for t in transactions:
            if t["type"] == "expense":
                if t["category"] not in category_expenses:
                    category_expenses[t["category"]] = 0
                category_expenses[t["category"]] += t["amount"]
    
    expenses_by_category = [{"category": k, "amount": v} for k, v in category_expenses.items()]
    
    # Balance history (last 30 days)
    from collections import defaultdict
    balance_by_date = defaultdict(float)
    
    current_balance = 0 
    
    if transactions:
        sorted_transactions = sorted(transactions, key=lambda x: x["date"])
        for t in sorted_transactions:
            if t["type"] == "income":
                current_balance += t["amount"]
            else:
                current_balance -= t["amount"]
            balance_by_date[t["date"]] = current_balance
    
    balance_history = [{"date": k, "balance": v} for k, v in sorted(balance_by_date.items())]
    
    return {
        "total_balance": total_balance,
        "total_income": total_income,
        "total_expense": total_expense,
        "expenses_by_category": expenses_by_category,
        "balance_history": balance_history[-30:]
    }

# AI Analysis Endpoint (Real - Google Gemini + YFinance) - TRADER PRO
class AIAnalysisRequest(BaseModel):
    symbol: str
    period: str = "1d" # 15m, 30m, 1h, 4h, 1d, 1wk, 1mo
    language: str = "en" # 'tr', 'en', 'de', etc.

@api_router.post("/ai-analysis")
async def get_ai_analysis(request: AIAnalysisRequest, user_data: dict = Depends(verify_token)):
    import yfinance as yf
    import google.generativeai as genai
    import pandas as pd
    import numpy as np
    from datetime import datetime
    
    symbol = request.symbol.upper().strip()
    period = request.period
    lang = request.language

    # Kripto para düzeltmesi (Major cryptos that conflict with stocks or need explicit -USD)
    # Synced with frontend POPULAR_ASSETS
    crypto_list = [
        "BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "AVAX", "DOGE", "DOT", "MATIC", "LINK", "UNI",
        "ATOM", "LTC", "BCH", "NEAR", "APT", "ARB", "OP", "SUI", "TIA", "INJ", "SEI", "FTM",
        "ALGO", "VET", "ICP", "HBAR", "FIL", "AAVE", "MKR", "GRT", "SAND", "MANA", "AXS", "THETA",
        "XLM", "XMR", "EOS", "SHIB", "PEPE", "WIF", "BONK", "FLOKI", "GALA", "CHZ", "ENJ", "ROSE",
        "RUNE", "KAVA"
    ]
    if symbol in crypto_list:
        symbol = f"{symbol}-USD"
    
    api_key = os.environ.get("GOOGLE_API_KEY")

    # 1. Fetch Real Market Data (Multi-Period)
    try:
        logger.info(f"Fetching data for symbol: {symbol} with period: {period}")
        
        # Determine yfinance interval based on user period
        interval_map = {
            "15m": "15m", "30m": "30m", "1h": "1h", "4h": "1h", # 4h not directly supported efficiently, emulate with 1h
            "1d": "1d", "1wk": "1wk", "1mo": "1mo"
        }
        yf_interval = interval_map.get(period, "1d")
        yf_period = "1mo" # Default fetch range
        
        if period in ["15m", "30m", "1h"]: yf_period = "5d" # Shorter range for intraday
        if period == "1wk": yf_period = "1y"
        if period == "1mo": yf_period = "2y"

        # Helper function to fetch data
        def fetch_data(sym):
            logger.info(f"Attempting to fetch {sym}...")
            t = yf.Ticker(sym)
            try:
                h = t.history(period=yf_period, interval=yf_interval)
                logger.info(f"Fetched {len(h)} rows for {sym}")
                return h, sym
            except Exception as e:
                logger.error(f"Error fetching {sym}: {e}")
                import pandas as pd
                return pd.DataFrame(), sym

        # A. Try the symbol (modified or original)
        history, final_symbol = fetch_data(symbol)

        # B. If empty, and symbol doesn't have a suffix, try adding -USD (Fallback for unknown cryptos)
        if history.empty and "-" not in symbol:
             # Only try -USD if it looks like a ticker
             alt_symbol = f"{symbol}-USD"
             logger.info(f"First attempt empty. Trying alt symbol: {alt_symbol}")
             history_alt, _ = fetch_data(alt_symbol)
             if not history_alt.empty:
                 history = history_alt
                 final_symbol = alt_symbol
        
        if history.empty:
             logger.error(f"History is empty for {symbol} (and alt attempts)")
             raise HTTPException(status_code=404, detail="Symbol not found or no data available")
        
        # Use the successful symbol
        symbol = final_symbol

        # Calculate Technical Indicators (RSI, MACD, Bollinger) manually since we don't have talib
        # RSI
        if len(history) < 20:
             logger.warning(f"Not enough data for indicators. Rows: {len(history)}")
        
        delta = history['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        history['RSI'] = 100 - (100 / (1 + rs))
        
        # SMA
        history['SMA_20'] = history['Close'].rolling(window=20).mean()
        history['SMA_50'] = history['Close'].rolling(window=50).mean()
        
        current_price = float(history['Close'].iloc[-1])
        open_price = float(history['Open'].iloc[-1])
        change_24h = ((current_price - open_price) / open_price) * 100
        
        rsi_val = float(history['RSI'].iloc[-1]) if not np.isnan(history['RSI'].iloc[-1]) else 50.0
        sma_20_val = float(history['SMA_20'].iloc[-1]) if not np.isnan(history['SMA_20'].iloc[-1]) else current_price
        
        # Ensure values are not NaN before using in f-strings or logic (though we clean at end)
        if np.isnan(change_24h): change_24h = 0.0
        
        high_val = float(history['High'].max())
        low_val = float(history['Low'].min())
        
        logger.info(f"Market Data Processed: Price={current_price}, RSI={rsi_val}")
        
    except Exception as e:
        logger.error(f"YFinance Error for {symbol}: {e}", exc_info=True)
        # Fallback to simple price if history fails but we can get info?
        # For now, just ensure we return a 404 or a specific error code
        if "NoneType" in str(e):
             raise HTTPException(status_code=503, detail=f"Market data provider error for {symbol}. Please try again later. (YF-NONE)")
        raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}. Verify the symbol is correct.")

    # 2. AI Analysis (Google Gemini) - Trader Pro Prompt
    if not api_key:
        logger.error("GOOGLE_API_KEY is missing")
        analysis_text = "API Key Missing!"
        sentiment = "Neutral"
        confidence = 0
    else:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            prompt = f"""
            You are an elite Wall Street Quant & Technical Analyst with 20 years of experience.
            Perform a DEEP DIVE analysis on {symbol} ({period}).
            Language: {lang}.
            
            Market Data: 
            - Current Price: ${current_price:.2f}
            - RSI(14): {rsi_val:.2f}
            - SMA(20): ${sma_20_val:.2f}
            
            Your Mission:
            1. Analyze Market Structure (Trends, Liquidity Zones, Order Blocks).
            2. Identify Institutional Activity (Whale movements, Volume anomalies).
            3. Provide a clear, actionable Trading Strategy with SPECIFIC PRICE LEVELS.
            
            CRITICAL: You MUST provide EXACT NUMERIC price levels for all signals.
            
            RESPONSE FORMAT (JSON ONLY - No Markdown, No explanations outside JSON):
            {{
                "sentiment": "Bullish",
                "confidence": 85,
                "signal": {{
                    "entry_price": "{current_price:.2f}",
                    "stop_loss": "{(current_price * 0.97):.2f}",
                    "take_profit_1": "{(current_price * 1.03):.2f}",
                    "take_profit_2": "{(current_price * 1.06):.2f}"
                }},
                "support_levels": [{(current_price * 0.95):.2f}, {(current_price * 0.92):.2f}, {(current_price * 0.88):.2f}],
                "resistance_levels": [{(current_price * 1.05):.2f}, {(current_price * 1.08):.2f}, {(current_price * 1.12):.2f}],
                "analysis_html": "<p><b>Market Structure:</b> Your deep analysis here...</p><p><b>Whale Watch:</b> Institutional flows...</p><p><b>Verdict:</b> Final recommendation.</p>"
            }}
            
            RULES:
            - ALL price values must be NUMBERS (not strings with $ symbols)
            - Calculate entry/stop/targets based on current price: ${current_price:.2f}
            - Use 2-3% stop loss, 3-6% take profit targets
            - Support levels should be BELOW current price
            - Resistance levels should be ABOVE current price
            - DO NOT leave any field empty or as placeholder text
            """
            
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            
            import json
            try:
                ai_data = json.loads(text)
                sentiment = ai_data.get("sentiment", "Neutral")
                confidence = ai_data.get("confidence", 50)
                analysis_text = ai_data.get("analysis_html", "")
                signal_data = ai_data.get("signal", {})
                support_levels = ai_data.get("support_levels", [])
                resistance_levels = ai_data.get("resistance_levels", [])
                
                # Fallback: If analysis_html is empty, use raw text or generate default
                if not analysis_text or analysis_text.strip() == "":
                    logger.warning("analysis_html field is empty, using fallback")
                    analysis_text = f"<p><b>Market Analysis for {symbol}</b></p><p>Current price: ${current_price:.2f}</p><p>{text[:500]}</p>"
                
                # Clean signal data - remove $ symbols if present
                if signal_data:
                    for key in ["entry_price", "stop_loss", "take_profit_1", "take_profit_2"]:
                        if key in signal_data and isinstance(signal_data[key], str):
                            signal_data[key] = signal_data[key].replace('$', '').strip()
                
            except Exception as parse_error:
                logger.error(f"JSON Parse Error: {parse_error} - Text: {text}")
                sentiment = "Neutral"
                confidence = 0
                analysis_text = f"<p>AI Analysis Unavailable. Raw response: {text[:200]}...</p>"
                signal_data = {}
                support_levels = []
                resistance_levels = []

            # UNIVERSAL SAFETY NET: Ensure signals are ALWAYS populated
            if not signal_data or not signal_data.get("entry_price"):
                signal_data = {
                    "entry_price": f"{current_price:.2f}",
                    "stop_loss": f"{current_price * 0.97:.2f}",
                    "take_profit_1": f"{current_price * 1.03:.2f}",
                    "take_profit_2": f"{current_price * 1.06:.2f}"
                }
            
            # Ensure levels exist
            if not support_levels:
                support_levels = [round(current_price * 0.95, 2), round(current_price * 0.92, 2), round(current_price * 0.90, 2)]
            if not resistance_levels:
                resistance_levels = [round(current_price * 1.05, 2), round(current_price * 1.08, 2), round(current_price * 1.12, 2)]
                
        except Exception as e:
            logger.error(f"Gemini AI Error: {e}")
            sentiment = "Neutral"
            confidence = 0
            analysis_text = f"Error: {str(e)}"

    # Sanitize data for JSON (NaN -> None)
    def clean_float(val):
        if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
            return None
        return val

    # Helper to safely parse signals to float/string or keep as is
    # signal_data values might be strings or floats.
    
    return {
        "symbol": symbol,
        "price": clean_float(current_price),
        "change_24h": clean_float(round(change_24h, 2)) if change_24h is not None else 0.0,
        "sentiment": sentiment,
        "confidence": confidence,
        "analysis": analysis_text,
        "signal": signal_data,
        "support_levels": [clean_float(x) for x in support_levels],
        "resistance_levels": [clean_float(x) for x in resistance_levels],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()