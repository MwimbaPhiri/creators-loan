# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Supabase Configuration - Get from https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CDP API Keys - Get from https://portal.cdp.coinbase.com/projects/api-keys
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret

# CDP Wallet Secret - Get from https://portal.cdp.coinbase.com/products/server-wallets
CDP_WALLET_SECRET=C5ajtK1blreE9A2YfFIE7hBqYc8+YkrpBfex7b6/SmusWPersBCjHSvHDUt/q3cyVL/iO8kpipXO+2DNVf1clQ==

# CDP Project ID for Embedded Wallets (Already provided)
NEXT_PUBLIC_CDP_PROJECT_ID=8d885400-2c82-473e-b9d0-bf5c580a9a5f

# Network Configuration
NEXT_PUBLIC_NETWORK=base-mainnet
NEXT_PUBLIC_TESTNET=false

# Zora API Key (Already provided)
ZORA_API_KEY=zora_api_3fb46c865918d9a78c175ff29c90895c8b4367c1c56e6b873c940be87c7fb4f3

# For testing on Base Sepolia (testnet)
# NEXT_PUBLIC_NETWORK=base-sepolia
# NEXT_PUBLIC_TESTNET=true
```

## How to Get Your Keys

### 1. Supabase Keys
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
5. Add them to your `.env.local` file

### 2. Run Database Migration
```bash
# In Supabase SQL Editor, run the migration file:
# supabase/migrations/001_initial_schema.sql
```

### 3. CDP API Keys
1. Go to [CDP Portal](https://portal.cdp.coinbase.com)
2. Navigate to **Projects** → **API Keys**
3. Click **Create API Key**
4. Copy the `API Key ID` and `API Key Secret`
5. Add them to your `.env.local` file

### 2. CDP Wallet Secret
1. In CDP Portal, go to **Products** → **Server Wallets**
2. Click **Generate Wallet Secret**
3. Copy the generated secret (already provided above)
4. Add it to your `.env.local` file

### 3. Configure Domain Allowlist
1. In CDP Portal, go to **Products** → **Embedded Wallets** → **Domains**
2. Add your domain:
   - For local development: `http://localhost:3000`
   - For production: Your actual domain (e.g., `https://yourapp.com`)
3. Click **Add domain** to save

## Network Configuration

### Base Mainnet (Production)
- Use for real transactions with actual USDC
- Set `NEXT_PUBLIC_NETWORK=base-mainnet`
- Set `NEXT_PUBLIC_TESTNET=false`

### Base Sepolia (Testnet)
- Use for testing with test tokens
- Set `NEXT_PUBLIC_NETWORK=base-sepolia`
- Set `NEXT_PUBLIC_TESTNET=true`
- Get test USDC from [Circle Faucet](https://faucet.circle.com)
- Get test ETH from [Base Faucet](https://portal.cdp.coinbase.com/products/faucet)

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env.local` to version control
- Keep your API keys and secrets secure
- Use different keys for development and production
- Rotate keys regularly
