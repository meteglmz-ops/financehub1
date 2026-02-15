@echo off
echo ===================================================
echo FinanceHub Otomatik Kurulum Sihirbazi
echo ===================================================
echo.
echo 1. Git Deposu Hazirlaniyor...
git init
git add .
git commit -m "Otomatik kurulum icin hazirlik"
echo.
echo [OK] Kodlar internete yuklenmeye hazir.
echo.
echo ===================================================
echo SIMDI YAPMANIZ GEREKENLER (Sadece 2 Adim):
echo ===================================================
echo.
echo 1. GITHUB: 'github.com/new' adresine gidin.
echo    - Repo adi: 'financehub-app'
echo    - 'Create repository' butonuna basin.
echo    - Size verilen HTTPS linkini kopyalayin.
echo.
echo 2. BU PENCEREYE: Kopyaladiginiz linki asagiya yapistirin.
echo.
set /p REMOTE_URL="GitHub Linkini Yapistirin ve Enter'a basin: "

if "%REMOTE_URL%"=="" goto END

echo.
echo GitHub baglantisi kuruluyor...
git remote add origin %REMOTE_URL%
git branch -M main
git push -u origin main
echo.
echo [OK] Kodlariniz GitHub'a yuklendi!
echo.
echo Simdi Render.com adresine gidip 'New Web Service' diyerek
echo GitHub hesabinizdaki 'financehub-app' projesini secebilirsiniz.
echo.
pause
:END
