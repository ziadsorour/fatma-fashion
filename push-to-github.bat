@echo off
title Push FATMA Fashion to GitHub
color 0b
echo ========================================================
echo        FATMA - FASHION FOR GIRLS TO GITHUB
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/2] Checking Git repository status...
"C:\Program Files\Microsoft Visual Studio\18\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe" status

echo.
echo [2/2] Pushing code to https://github.com/ziadsorour/fatma-fashion.git ...
echo (If a browser window or login prompt pops up, please sign in to GitHub)
echo.

"C:\Program Files\Microsoft Visual Studio\18\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe" push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   SUCCESS! The project has been pushed to GitHub!
    echo   Repository: https://github.com/ziadsorour/fatma-fashion
    echo ========================================================
    echo.
    echo Next step: Go to https://vercel.com/new and import ziadsorour/fatma-fashion!
) else (
    echo.
    echo If push failed, you may need to authenticate with GitHub.
)
echo.
pause
