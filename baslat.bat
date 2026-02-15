@echo off
setlocal

echo ==========================================
echo FinanceHub Baslatici
echo ==========================================

REM Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Python bulunamadi! Lutfen Python'u yukleyin ve PATH'e ekleyin.
    pause
    exit /b
)

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Node.js bulunamadi! Lutfen Node.js'i yukleyin.
    pause
    exit /b
)

echo.
echo [1/4] Backend kurulumu yapiliyor...
cd backend
if not exist "venv" (
    echo Sanal ortam olusturuluyor...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Gereklilikler yukleniyor...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [UYARI] Bazi paketler yuklenemedi. Devam ediliyor...
)

echo.
echo [2/4] Frontend kurulumu yapiliyor...
cd ..\frontend
if not exist "node_modules" (
    echo Node modulleri yukleniyor (bu islem biraz surebilir)...
    call npm install
)

echo.
echo [3/4] Uygulama baslatiliyor...
echo Yeni pencerelerde Backend ve Frontend acilacak.
echo Lutfen bu pencereyi KAPATMAYIN.
echo.

REM Start Backend
start "FinanceHub Backend" cmd /k "cd ..\backend && venv\Scripts\activate && uvicorn server:app --reload --port 8000"

REM Start Frontend
start "FinanceHub Frontend" cmd /k "npm start"

echo.
echo [4/4] Islem tamamlandi!
echo Tarayicinizda http://localhost:3000 adresi acilacaktir.
echo.
echo Cikis yapmak icin herhangi bir tusa basin...
pause >nul
