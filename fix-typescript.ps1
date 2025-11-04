# Fix TypeScript Errors Script
# This script helps resolve TypeScript cache issues

Write-Host "🔧 Fixing TypeScript Errors..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
Write-Host "1. Checking if @coinbase/cdp-react is installed..." -ForegroundColor Yellow
if (Test-Path "node_modules/@coinbase/cdp-react") {
    Write-Host "   ✅ Package is installed!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Package not found. Installing..." -ForegroundColor Red
    npm install --legacy-peer-deps
}

Write-Host ""
Write-Host "2. Clearing TypeScript cache..." -ForegroundColor Yellow
$tsCachePath = "$env:LOCALAPPDATA\Microsoft\TypeScript"
if (Test-Path $tsCachePath) {
    Remove-Item -Recurse -Force $tsCachePath -ErrorAction SilentlyContinue
    Write-Host "   ✅ TypeScript cache cleared!" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No cache to clear" -ForegroundColor Gray
}

Write-Host ""
Write-Host "3. Reloading VS Code..." -ForegroundColor Yellow
Write-Host "   Please manually reload VS Code window:" -ForegroundColor Cyan
Write-Host "   - Press Ctrl+Shift+P" -ForegroundColor White
Write-Host "   - Type: Developer: Reload Window" -ForegroundColor White
Write-Host "   - Press Enter" -ForegroundColor White

Write-Host ""
Write-Host "✨ Done! After reloading VS Code, your TypeScript errors should be gone!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 If errors persist, check FIX-TYPESCRIPT-ERRORS.md for more solutions" -ForegroundColor Gray
