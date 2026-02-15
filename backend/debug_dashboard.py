
from fastapi.testclient import TestClient
from server import app
import os
import sys

# Add the backend directory to sys.path so we can import server
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

client = TestClient(app)

def test_dashboard_stats():
    print("Testing /api/dashboard/stats endpoint...")
    
    # We need to mock authentication or bypass it. 
    # server.py uses `Depends(verify_token)`.
    
    from auth import verify_token
    async def mock_verify_token():
        return {"uid": "test_user_id"}
    
    app.dependency_overrides[verify_token] = mock_verify_token

    try:
        response = client.get("/api/dashboard/stats")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS: Dashboard endpoint is working.")
            import json
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"FAILURE: Dashboard endpoint returned error {response.status_code}")
            print(f"Response Body: {response.text}")

    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    # Ensure env vars are loaded
    from dotenv import load_dotenv
    load_dotenv()
    test_dashboard_stats()
