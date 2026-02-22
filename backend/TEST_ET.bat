@echo off
title FinanceHub - Diagnostic Test
color 0E
echo.
echo  ================================================
echo   FINANCEHUB - SISTEM TANI VE TEST ARACI
echo  ================================================
echo.

set MONGO_URL=mongodb://localhost:27017
set DB_NAME=financehub
set AUTH_MODE=mock

echo  [1/4] Python ve Paket Kontrolu...
.\venv2\Scripts\python.exe -c "import fastapi; import google.genai; import motor; import yfinance; print('  PASSED: Temel paketler yuklu.')" || (echo FAILED: Paketler eksik! && pause && exit)

echo.
echo  [2/4] Backend Sunucusunu Test Modunda Baslatma...
echo  (Lutfen bekleyin, sunucu hazir oldugunda test sorgusu gonderilecek)
start /b "" cmd /c "cd /d %~dp0 && .\venv2\Scripts\uvicorn.exe server:app --host 127.0.0.1 --port 8888"

timeout /t 5 /nobreak >nul

echo.
echo  [3/4] Endpoint Testleri Yapiliyor...
echo.

echo  - Health Check:
powershell -Command "Invoke-WebRequest -Uri 'http://127.0.0.1:8888/health' -TimeoutSec 5 | Select-Object -ExpandProperty Content"

echo.
echo  - Dashboard Stats (Resilience Test):
powershell -Command "Invoke-WebRequest -Headers @{'Authorization'='Bearer mock-token'} -Uri 'http://127.0.0.1:8888/api/dashboard/stats' -TimeoutSec 5 | Select-Object -ExpandProperty Content"

echo.
echo  - AI Analysis (Symbol: BTC):
powershell -Command "Invoke-WebRequest -Method POST -Headers @{'Authorization'='Bearer mock-token'; 'Content-Type'='application/json'} -Body '{ \"symbol\": \"BTC\", \"period\": \"1d\", \"language\": \"tr\" }' -Uri 'http://127.0.0.1:8888/api/ai-analysis' -TimeoutSec 20 | Select-Object -ExpandProperty Content"

echo.
echo.
echo  [4/4] Test Tamamlandi.
echo  Ustteki ciktilarda hata yoksa (JSON donuyorsa) sistem calisiyor demektir.
echo  Test sunucusu kapatiliyor...
taskkill /F /IM uvicorn.exe /T >nul 2>&1
echo.
echo  ================================================
pause
