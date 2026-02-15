@echo off
echo Dis Erisim Icin Sunucular Baslatiliyor (IP: 10.154.193.17)...

start "Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8000 --reload"
start "Frontend" cmd /k "cd frontend && set HOST=0.0.0.0 && npm start"

echo.
echo Erisim Adresleri:
echo Bilgisayardan: http://localhost:3000
echo Telefondan:    http://10.154.193.17:3000
echo.
pause
