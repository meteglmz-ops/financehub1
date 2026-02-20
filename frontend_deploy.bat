@echo off
echo ===================================================
echo FinanceHub Frontend Yayini (Deploy)
echo ===================================================
echo.
echo 1. Frontend klasorune geciliyor...
cd frontend

echo.
echo 2. Proje insa ediliyor (Build)...
echo Lutfen bekleyin, bu islem 1-2 dakika surebilir...
call npm.cmd run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [HATA] Build islemi basarisiz oldu. Lutfen kirmizi hatayi okuyun.
    pause
    exit /b
)

echo.
echo 3. Firebase'e yukleniyor (Deploy)...
call firebase.cmd deploy

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [UYARI] Firebase komutu calismadi. 'firebase-tools' yuklu mu?
    echo Veya giris yapmadiniz mi? 'firebase login' yapmayi deneyin.
    pause
    exit /b
)

echo.
echo ===================================================
echo [BASARILI] Siteniz yayinda!
echo Yukaridaki 'Hosting URL' linkine tiklayabilirsiniz.
echo ===================================================
pause
