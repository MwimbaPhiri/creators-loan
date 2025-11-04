@echo off
echo ========================================
echo   Push to GitHub - creators-loan
echo ========================================
echo.
echo This will push your code to:
echo https://github.com/MwimbaPhiri/creators-loan
echo.
echo IMPORTANT: You need to authenticate first!
echo.
echo Option 1: Use GitHub CLI (Recommended)
echo   1. Install GitHub CLI: https://cli.github.com/
echo   2. Run: gh auth login
echo   3. Then run this script again
echo.
echo Option 2: Use Personal Access Token
echo   1. Go to: https://github.com/settings/tokens
echo   2. Generate new token (classic)
echo   3. Select 'repo' scope
echo   4. Copy the token
echo   5. When prompted for password, paste the token
echo.
pause
echo.
echo Attempting to push...
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo View your repository at:
    echo https://github.com/MwimbaPhiri/creators-loan
) else (
    echo ========================================
    echo   FAILED! Authentication required
    echo ========================================
    echo.
    echo Please follow one of the authentication methods above
    echo Then run this script again
)
echo.
pause
