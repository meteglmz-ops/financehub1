@echo off
title FinanceHub Kurulumu (Kesin Cozum)
color 0f
cls

echo ===================================================
echo   FINANCEHUB KURULUMU - KESIN COZUM
echo ===================================================
echo.
echo   Daha onceki hatalari yok sayarak "Temiz Kurulum" yapiyoruz.
echo   Bu islem sirasinda internet baglantiniz kullanilacak.
echo   Lutfen siyah pencereyi KAPATMAYIN, islem bitince tarayici acilacak.
echo.

cd frontend

echo   1. Adim: Eksik dosyalar indiriliyor...
echo   (Hata mesajlarini gormezden gelerek zorla yukleme yapiliyor)
call npm.cmd install --legacy-peer-deps --no-audit

echo.
echo   2. Adim: Dosyalar hazir! Site aciliyor...
echo.

start http://localhost:3000
call npm.cmd start

pause
