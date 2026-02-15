@echo off
setlocal
echo ==========================================
echo FinanceHub DEMO MODU Baslatiliyor
echo ==========================================
echo.

cd frontend

rem Node_modules kontrolü
if exist "node_modules" (
    echo Kurulum daha once yapilmis gozukuyor.
) else (
    echo [BILGI] Gerekli dosyalar eksik (node_modules).
    echo Otomatik kurulum baslatiliyor...
    echo.
    echo Lutfen bekleyin, bu islem 1-2 dakika surebilir...
    echo.
    call npm.cmd install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo [HATA] Kurulum basarisiz oldu. Internet baglantinizi kontrol edin.
        pause
        exit /b
    )
)

echo.
echo Uygulama baslatiliyor...
echo Tarayiciniz otomatik acilacak.
echo.

call npm.cmd start

pause
