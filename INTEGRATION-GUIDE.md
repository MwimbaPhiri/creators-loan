# Creator Loan Platform - CDP Integration Guide

## Overview

This guide explains how to integrate and use the CDP Server Wallets v2, Base Pay, and Embedded Wallets in your creator loan platform.

## Architecture

### 1. **Embedded Wallets** (Client-Side)
- Users sign in with email/SMS/OAuth
- Automatic smart wallet creation
- No seed phrases or extensions needed
- Integrated via `@coinbase/cdp-react`

### 2. **Server Wallets v2** (Server-Side)
- Escrow accounts for holding collateral
- Automated collateral management
- Secure key management via CDP
- Integrated via `@coinbase/cdp-sdk`

### 3. **Base Pay** (Client-Side)
- One-click USDC payments
- Gas sponsorship included
- Fast settlement (<2 seconds)
- Integrated via `@base-org/account`

## Setup Instructions

### Step 1: Environment Configuration

1. Create a `.env.local` file in the project root
2. Add your CDP credentials (see `ENV-SETUP.md` for details)
3. Configure your domain in CDP Portal

```bash
# Required environment variables
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=C5ajtK1blreE9A2YfFIE7hBqYc8+YkrpBfex7b6/SmusWPersBCjHSvHDUt/q3cyVL/iO8kpipXO+2DNVf1clQ==
NEXT_PUBLIC_CDP_PROJECT_ID=8d885400-2c82-473e-b9d0-bf5c580a9a5f
NEXT_PUBLIC_NETWORK=base-mainnet
NEXT_PUBLIC_TESTNET=false
```

### Step 2: Test the Integration

```bash
# Install dependencies (already done)
npm install --legacy-peer-deps

# Run development server
npm run dev
```

## Usage Guide

### For Users (Borrowers)

#### 1. Sign In
```tsx
import { SignInButton } from "@/components/auth/SignInButton";

// In your component
<SignInButton />
```

Users can sign in with:
- Email (OTP verification)
- SMS (OTP verification)
- Google OAuth
- Apple OAuth

#### 2. Apply for Loan
When applying for a loan, users must:
1. Provide creator coin address
2. Specify loan amount
3. The system validates the coin via Zora API

#### 3. Deposit Collateral
```tsx
import { DepositCollateral } from "@/components/escrow/DepositCollateral";

<DepositCollateral
  loanId="loan-123"
  requiredCollateralAmount={1000}
  creatorCoinAddress="0x..."
  escrowAddress="0x..."
  onDepositSuccess={() => console.log("Deposited!")}
/>
```

Flow:
1. Click "Validate Creator Coin" - checks ownership via Zora API
2. If valid, enter deposit amount
3. Click "Deposit Collateral" - sends tokens to escrow
4. Transaction is confirmed on-chain

#### 4. Repay Loan with Base Pay
```tsx
import { BasePayButton } from "@/components/payments/BasePayButton";

<BasePayButton
  amount="100.00"
  recipientAddress="0x..."
  loanId="loan-123"
  onSuccess={(paymentId, txHash) => {
    console.log("Payment successful!", paymentId);
  }}
  collectUserInfo={true}
/>
```

Features:
- Pays in USDC on Base
- Gas fees sponsored
- Collateral automatically released proportionally
- Fast confirmation

### For Platform (Server-Side)

#### 1. Create Escrow Account
```typescript
import { createLoanEscrowAccount } from "@/lib/services/serverWallet";

const escrowAccount = await createLoanEscrowAccount("loan-123");
console.log("Escrow address:", escrowAccount.address);
```

#### 2. Monitor Escrow Balance
```typescript
import { getEscrowBalance } from "@/lib/services/serverWallet";

const balance = await getEscrowBalance(
  escrowAccount.address,
  "base-mainnet"
);
```

#### 3. Release Collateral
```typescript
import { sendFromEscrow } from "@/lib/services/serverWallet";

await sendFromEscrow({
  fromAddress: escrowAddress,
  toAddress: borrowerAddress,
  amount: BigInt("1000000000000000000"), // 1 token
  network: "base-mainnet",
});
```

## API Endpoints

### POST `/api/escrow/create`
Creates a new escrow account for a loan.

**Request:**
```json
{
  "loanId": "loan-123"
}
```

**Response:**
```json
{
  "success": true,
  "escrowAddress": "0x...",
  "loanId": "loan-123"
}
```

### POST `/api/escrow/confirm-deposit`
Confirms collateral deposit.

**Request:**
```json
{
  "loanId": "loan-123",
  "txHash": "0x...",
  "amount": "1000"
}
```

### POST `/api/zora/validate-coin`
Validates creator coin ownership.

**Request:**
```json
{
  "coinAddress": "0x...",
  "userAddress": "0x..."
}
```

**Response:**
```json
{
  "isValid": true,
  "balance": 100,
  "message": "Creator coin validated successfully"
}
```

### POST `/api/payments/process-repayment`
Processes loan repayment and releases collateral.

**Request:**
```json
{
  "loanId": "loan-123",
  "paymentId": "pay_...",
  "amount": "100.00",
  "borrowerAddress": "0x..."
}
```

## Loan Flow

### Complete Loan Lifecycle

1. **Application**
   - User signs in with embedded wallet
   - Fills out loan application
   - System creates escrow account

2. **Collateral Deposit**
   - System validates creator coin via Zora API
   - User deposits tokens to escrow
   - Loan is approved and funded

3. **Repayment**
   - User makes payments via Base Pay
   - Each payment triggers proportional collateral release
   - System tracks remaining balance

4. **Completion**
   - Final payment releases all remaining collateral
   - Loan marked as complete
   - User regains full control of tokens

## Security Features

### Embedded Wallets
- Non-custodial (user controls keys)
- MPC (Multi-Party Computation) security
- No seed phrases to manage
- Automatic backup and recovery

### Server Wallets
- Escrow accounts isolated per loan
- Keys managed by CDP infrastructure
- Automatic transaction signing
- Audit trail for all operations

### Base Pay
- USDC payments (stablecoin)
- On-chain verification
- No chargebacks
- Instant settlement

## Testing

### Testnet Setup
1. Set `NEXT_PUBLIC_TESTNET=true`
2. Set `NEXT_PUBLIC_NETWORK=base-sepolia`
3. Get test funds:
   - ETH: [Base Faucet](https://portal.cdp.coinbase.com/products/faucet)
   - USDC: [Circle Faucet](https://faucet.circle.com)

### Test Scenarios

#### Test 1: Sign In
```bash
# Expected: User can sign in with email
# Verify: Wallet address is displayed
```

#### Test 2: Deposit Collateral
```bash
# Expected: User can deposit test tokens
# Verify: Transaction appears on BaseScan Sepolia
```

#### Test 3: Base Pay
```bash
# Expected: Payment completes in <5 seconds
# Verify: USDC balance updated
```

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors
- Restart TypeScript server in IDE
- Run `npm install --legacy-peer-deps` again
- Check `tsconfig.json` has `moduleResolution: "node16"`

#### 2. "Invalid API key"
- Verify `.env.local` exists
- Check CDP Portal for correct keys
- Ensure keys are not expired

#### 3. "Domain not allowed"
- Add domain to CDP Portal allowlist
- For local dev: `http://localhost:3000`
- For production: Your actual domain

#### 4. "Transaction failed"
- Check network (mainnet vs testnet)
- Verify sufficient gas/balance
- Check BaseScan for error details

## Next Steps

### Recommended Enhancements

1. **Database Integration**
   - Store loan applications in Prisma
   - Track escrow addresses per loan
   - Log all transactions

2. **Real Zora API Integration**
   - Replace mock validation in `/api/zora/validate-coin`
   - Implement actual token balance checks
   - Add metadata fetching

3. **Automated Collateral Release**
   - Create cron job for payment monitoring
   - Automatic proportional release
   - Email notifications

4. **Risk Management**
   - Implement LTV (Loan-to-Value) monitoring
   - Automatic liquidation triggers
   - Price oracle integration

5. **User Dashboard**
   - Loan history
   - Payment schedule
   - Collateral status

## Support

- CDP Documentation: https://docs.cdp.coinbase.com
- Base Documentation: https://docs.base.org
- Zora API: https://docs.zora.co

## Files Created

### Components
- `/src/components/providers/CDPProvider.tsx` - Embedded wallet provider
- `/src/components/auth/SignInButton.tsx` - Authentication UI
- `/src/components/payments/BasePayButton.tsx` - Base Pay integration
- `/src/components/escrow/DepositCollateral.tsx` - Collateral deposit flow

### Services
- `/src/lib/services/serverWallet.ts` - Server wallet operations

### API Routes
- `/src/app/api/escrow/create/route.ts` - Create escrow accounts
- `/src/app/api/escrow/confirm-deposit/route.ts` - Confirm deposits
- `/src/app/api/zora/validate-coin/route.ts` - Validate creator coins
- `/src/app/api/payments/process-repayment/route.ts` - Process repayments

### Documentation
- `/ENV-SETUP.md` - Environment configuration guide
- `/INTEGRATION-GUIDE.md` - This file
