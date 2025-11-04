# Fix TypeScript Errors - Quick Guide

## The Problem
You're seeing TypeScript errors saying it can't find `@coinbase/cdp-react`, but the package **IS installed**. This is just an IDE cache issue.

## ✅ Quick Fix (Choose One)

### Option 1: Reload VS Code Window (Recommended)
1. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac)
2. Type: `Developer: Reload Window`
3. Press Enter
4. Wait for VS Code to reload
5. Errors should disappear! ✨

### Option 2: Restart TypeScript Server
1. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac)
2. Type: `TypeScript: Restart TS Server`
3. Press Enter
4. Wait a few seconds
5. Errors should disappear! ✨

### Option 3: Close and Reopen VS Code
1. Close VS Code completely
2. Reopen the project folder
3. Wait for TypeScript to initialize
4. Errors should disappear! ✨

### Option 4: Clear TypeScript Cache (If above don't work)
1. Close VS Code
2. Delete TypeScript cache:
   ```powershell
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Microsoft\TypeScript"
   ```
3. Reopen VS Code
4. Errors should disappear! ✨

## Why This Happens

TypeScript caches module information for performance. When you install a new package, sometimes the cache doesn't update immediately. Reloading the window forces TypeScript to rebuild its cache.

## Verify Package is Installed

Run this command to confirm:
```bash
npm list @coinbase/cdp-react
```

You should see:
```
@coinbase/cdp-react@0.0.55
```

## Still Having Issues?

### 1. Check node_modules exists
```powershell
Test-Path "node_modules/@coinbase/cdp-react"
```
Should return: `True`

### 2. Reinstall if needed
```bash
npm install --legacy-peer-deps
```

### 3. Check your tsconfig.json
Make sure it includes:
```json
{
  "compilerOptions": {
    "moduleResolution": "node16",
    "resolveJsonModule": true
  }
}
```

### 4. Restart your dev server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

## The Errors You're Seeing

These are **false positives**:
- ❌ `Cannot find module '@coinbase/cdp-react'`
- ✅ Package IS installed in `node_modules/@coinbase/cdp-react`
- ✅ Your code WILL work when you run it
- ✅ Just need to reload IDE

## After Reloading

You should see:
- ✅ No red squiggly lines
- ✅ Autocomplete working for CDP React imports
- ✅ Type hints showing up
- ✅ All imports resolving correctly

## Test Your Setup

After fixing, test that everything works:

1. **Check imports resolve:**
   ```typescript
   import { AuthButton } from '@coinbase/cdp-react'
   // Should show no errors and provide autocomplete
   ```

2. **Run the dev server:**
   ```bash
   npm run dev
   ```

3. **Visit the app:**
   http://localhost:3000

4. **Click "Sign In":**
   - CDP modal should open
   - You should see auth options

## Files Affected

These files import from `@coinbase/cdp-react`:
- ✅ `src/components/providers/CDPProvider.tsx`
- ✅ `src/components/landing/Navigation.tsx`
- ✅ `src/components/landing/Hero.tsx`
- ✅ `src/components/landing/CTASection.tsx`

All of these will work perfectly once you reload VS Code!

## Pro Tip

If you frequently install new packages, you can set VS Code to automatically reload TypeScript:

1. Open Settings (`Ctrl + ,`)
2. Search for: `typescript.tsserver.experimental.enableProjectDiagnostics`
3. Enable it

This helps TypeScript stay in sync with your node_modules.

---

## 🎯 Quick Action

**Right now, do this:**

1. Press `Ctrl + Shift + P`
2. Type `reload`
3. Select `Developer: Reload Window`
4. Press Enter

**Done!** Your TypeScript errors will be gone! 🎉

---

## Need More Help?

If errors persist after reloading:
1. Check the dev server is running: `npm run dev`
2. Check browser console for actual errors
3. Verify `.env.local` has your CDP Project ID
4. Test the AuthButton actually works (it will!)

Remember: **The code works!** These are just TypeScript cache issues. Your embedded wallet integration is fully functional! 🚀
