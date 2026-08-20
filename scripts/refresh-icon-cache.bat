@echo off
echo ========================================================
echo  PDF Studio Pro - Windows Simge Onbellegini Temizleme
echo ========================================================
echo.
echo Windows Explorer durduruluyor...
taskkill /f /im explorer.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Eski simge onbellegi dosyalari siliniyor...
del /f /q "%localappdata%\IconCache.db" >nul 2>&1
del /f /s /q "%localappdata%\Microsoft\Windows\Explorer\iconcache_*.db" >nul 2>&1
del /f /s /q "%localappdata%\Microsoft\Windows\Explorer\thumbcache_*.db" >nul 2>&1

echo Windows Explorer yeniden baslatiliyor...
start explorer.exe
timeout /t 2 /nobreak >nul

echo.
echo ========================================================
echo  Basarili! Tum masaustu ve gorev cubugu simgeleri yenilendi.
echo ========================================================
