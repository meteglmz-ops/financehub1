
import os
import yfinance as yf
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

# Load env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
api_key = os.environ.get("GOOGLE_API_KEY")

print(f"API Key Found: {'YES' if api_key else 'NO'} ({api_key[:5]}...{api_key[-3:] if api_key else ''})")

# Test 1: yfinance
print("\n--- Testing yfinance (Market Data) ---")
try:
    symbol = "TSLA"
    print(f"Fetching {symbol} for 1mo...")
    ticker = yf.Ticker(symbol)
    history = ticker.history(period="5d", interval="1d")
    
    if history.empty:
        print("FAILED: No data fetched from yfinance.")
    else:
        print("SUCCESS: Fetched market data.")
        print(history.tail(2))
        current_price = history['Close'].iloc[-1]
        print(f"Current Price: {current_price:.2f}")

except Exception as e:
    print(f"FAILED: yfinance exception: {e}")

# Test 2: Gemini
print("\n--- Testing Gemini AI (Analysis) ---")
if not api_key:
    print("FAILED: No API Key provided.")
else:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        print("Sending prompt to Gemini...")
        response = model.generate_content("Say 'Gemini is working correctly' if you receive this.")
        
        print("Response received:")
        print(response.text)
        print("SUCCESS: AI generated content.")
        
    except Exception as e:
        print(f"FAILED: Gemini exception: {e}")
        # Identify common errors
        if "API_KEY_INVALID" in str(e):
            print("DIAGNOSIS: The API Key is invalid.")
        if "permission_denied" in str(e):
             print("DIAGNOSIS: Permission denied. Check key restrictions.")
