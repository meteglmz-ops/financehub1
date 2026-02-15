
try:
    import yfinance
    import google.generativeai
    print("Imports successful")
    print(f"yfinance version: {yfinance.__version__}")
    print(f"google.generativeai version: {google.generativeai.__version__}")
except ImportError as e:
    print(f"Import failed: {e}")
except Exception as e:
    print(f"Error: {e}")
