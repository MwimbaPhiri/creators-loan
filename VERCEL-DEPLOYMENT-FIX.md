# 🔧 Vercel Deployment Fix - Supabase Environment Variables

## Error

```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

## Cause

The Supabase environment variables are not set in Vercel, causing the build to fail.

## Solution

### Step 1: Add Environment Variables to Vercel

1. **Go to your Vercel project**: https://vercel.com/dashboard
2. **Select your project**: `creators-loan`
3. **Go to Settings** → **Environment Variables**
4. **Add these variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 2: Get Your Supabase Credentials

1. **Go to Supabase**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings** → **API**
4. **Copy these values**:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Add to Vercel

For each variable:
1. Click **Add New**
2. Enter **Key** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. Enter **Value** (your actual Supabase URL)
4. Select **All Environments** (Production, Preview, Development)
5. Click **Save**

### Step 4: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger deployment

## Quick Fix Commands

If you want to add them via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Redeploy
vercel --prod
```

## Alternative: Use Vercel's Supabase Integration

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Integrations**
4. **Search for "Supabase"**
5. **Click "Add Integration"**
6. **Connect your Supabase project**
7. **Environment variables will be added automatically**

## Other Required Environment Variables

Don't forget to add these as well:

```env
# CDP (Coinbase Developer Platform)
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id

# Database (if using Prisma)
DATABASE_URL=your_database_url

# Optional: Zora API
ZORA_API_KEY=your_zora_api_key
```

## Verify Environment Variables

After adding, verify they're set:

1. **Go to Settings** → **Environment Variables**
2. **Check all required variables are listed**
3. **Make sure they're enabled for all environments**

## Common Issues

### Issue 1: Variables Not Taking Effect
**Solution**: Redeploy after adding variables

### Issue 2: Wrong Environment
**Solution**: Make sure variables are added to "Production" environment

### Issue 3: Typos in Variable Names
**Solution**: Double-check spelling (case-sensitive!)
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ❌ `NEXT_PUBLIC_SUPABASE_URI`

## Test Deployment

After fixing:

1. **Push to GitHub** or **Redeploy**
2. **Check build logs**
3. **Should see**: ✓ Compiled successfully
4. **Visit your site**: https://creators-loan.vercel.app

## Summary

✅ Add Supabase environment variables to Vercel
✅ Get credentials from Supabase dashboard
✅ Add to all environments (Production, Preview, Development)
✅ Redeploy
✅ Verify deployment succeeds

Your app should now deploy successfully! 🎉
