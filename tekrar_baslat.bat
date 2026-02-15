@echo off
echo ==============================================
echo FinanceHub HIZLI BASLAT
echo ==============================================
echo.
echo 1. Backend Baslatiliyor...
start "FinanceHub Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn server:app --reload --port 8000"

echo 2. Frontend Baslatiliyor...
start "FinanceHub Frontend" cmd /k "npm start --prefix frontend"

echo.
echo Islem tamam! Pencereleri kapatmayin.
echo Tarayicida http://localhost:3000 acilacak.
pause
