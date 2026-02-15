
from fastapi.testclient import TestClient
from server import app
from auth import verify_token
import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Mock Auth
async def mock_verify_token():
    return {"uid": "test_user_id"}

app.dependency_overrides[verify_token] = mock_verify_token

client = TestClient(app)

def test_ai_analysis():
    print("Testing /api/ai-analysis endpoint with multiple symbols...")
    
    # List of symbols to test
    # 1. Standard Stock (AAPL)
    # 2. Crypto without suffix (BTC) -> Should auto-resolve to BTC-USD
    # 3. Crypto with suffix (BTC-USD)
    # 4. Invalid Symbol
    symbols = ["AAPL", "BTC", "BTC-USD", "INVALID123"]
    
    for sym in symbols:
        print(f"\n--- Testing Symbol: {sym} ---")
        payload = {
            "symbol": sym,
            "period": "1d",
            "language": "en"
        }

        try:
            response = client.post("/api/ai-analysis", json=payload)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"SUCCESS. Price: {data.get('price')}")
                print(f"Snippet: {data.get('analysis')[:100]}...")
            else:
                print(f"FAILURE. Response: {response.text}")

        except Exception as e:
            print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    if "GOOGLE_API_KEY" not in os.environ:
        print("WARNING: GOOGLE_API_KEY is not set!")
    else:
        print("GOOGLE_API_KEY is present.")

    test_ai_analysis()
