@echo off
setlocal

echo ===================================================
echo FinanceHub APK Olusturma Araci
echo ===================================================
echo.

:: Step 1: Frontend Build
echo 1. Frontend klasorunde build aliniyor...
cd frontend
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [HATA] Build islemi basarisiz oldu.
    pause
    exit /b %ERRORLEVEL%
)

:: Step 2: Capacitor Sync
echo.
echo 2. Capacitor senkronizasyonu yapiliyor...
call npx cap sync

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [HATA] Capacitor senkronizasyonu basarisiz oldu.
    pause
    exit /b %ERRORLEVEL%
)

:: Step 3: Open Android Studio
echo.
echo 3. Android Studio aciliyor...
echo.
echo ===================================================
echo [BILGI] Android Studio acildiginda su adimlari takip edin:
echo 1. Build -> Build Bundle(s) / APK(s) -> Build APK(s)
echo 2. Islem bittiginde sag altta beliren 'locate' butonuna basin.
echo ===================================================
echo.
call npx cap open android

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [NOT] Android Studio otomatik olarak acilamadi.
    echo Lutfen Android Studio'yu manuel olarak acin ve su klasoru 'Open' diyerek secin:
    echo %CD%\android
    echo.
)

echo Islem tamamlandi.
pause
