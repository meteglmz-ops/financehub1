@echo off
title FinanceHub - Yerel Test
color 0A
echo.
echo  ================================================
echo   FINANCEHUB - Yerel Test Baslatiliyor...
echo  ================================================
echo.

REM --- Backend Kontrol ---
echo  [1/2] Backend baslatiliyor (port 8000)...
start "FinanceHub BACKEND" cmd /k "cd /d %~dp0backend && set MONGO_URL=mongodb://localhost:27017 && set DB_NAME=financehub && set AUTH_MODE=mock && set CORS_ORIGINS=http://localhost:3000 && venv2\Scripts\uvicorn.exe server:app --host 127.0.0.1 --port 8000 --reload"

REM --- Kisa bekleme ---
timeout /t 3 /nobreak >nul

REM --- Frontend Kontrol ---
echo  [2/2] Frontend baslatiliyor (port 3000)...
start "FinanceHub FRONTEND" cmd /k "cd /d %~dp0frontend && npm start"

REM --- Tarayici ---
echo.
echo  Tarayici aciliyor...
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo  ================================================
echo   Her iki pencere de hazir oldugunda uygulama
echo   otomatik olarak tarayicida acilacak.
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo  ================================================
echo.
pause
