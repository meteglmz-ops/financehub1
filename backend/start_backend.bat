@echo off
set MONGO_URL=mongodb://localhost:27017
set DB_NAME=financehub
set AUTH_MODE=mock
set CORS_ORIGINS=http://localhost:3000
echo Backend baslatiliyor: http://127.0.0.1:8000
venv\Scripts\python.exe -m uvicorn server:app --host 127.0.0.1 --port 8000
