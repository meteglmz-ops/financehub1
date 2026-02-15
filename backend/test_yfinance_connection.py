
import yfinance as yf
import sys

def test_yfinance():
    symbol = "AAPL"
    print(f"Testing yfinance connection for symbol: {symbol}...")
    
    try:
        ticker = yf.Ticker(symbol)
        # Try fetching full history first
        history = ticker.history(period="1mo")
        
        if history.empty:
            print("FAILURE: yfinance returned empty history.")
            # detailed info
            print(f"Ticker info: {ticker.info}")
        else:
            print("SUCCESS: yfinance fetched data successfully.")
            print(history.head())
            
    except Exception as e:
        print(f"EXCEPTION: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_yfinance()
