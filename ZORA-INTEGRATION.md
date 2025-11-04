# Zora API Integration Guide

## Overview

Your platform now uses the **real Zora SDK API** to validate creator coins and check user ownership. No more mock data!

## API Key

Your Zora API key has been integrated:
```
zora_api_3fb46c865918d9a78c175ff29c90895c8b4367c1c56e6b873c940be87c7fb4f3
```

## Features Implemented

### 1. Creator Coin Validation
Validates that a user owns a specific creator coin and checks their balance.

**Endpoint:** `POST /api/zora/validate-coin`

**Request:**
```json
{
  "coinAddress": "0x...",
  "userAddress": "0x...",
  "chainId": 8453
}
```

**Response:**
```json
{
  "isValid": true,
  "balance": 123.45,
  "balanceRaw": "123450000000000000000",
  "message": "Creator coin validated successfully. You own 123.4500 tokens.",
  "coinData": {
    "name": "Creator Coin Name",
    "symbol": "CC",
    "address": "0x...",
    "marketCap": "50000.00",
    "priceInUsdc": "0.50",
    "uniqueHolders": 150,
    "totalSupply": "1000000"
  },
  "loanEligibility": {
    "isEligible": true,
    "marketCapUSD": 50000,
    "priceInUSDC": 0.50,
    "uniqueHolders": 150,
    "maxLoanAmount": 25000,
    "collateralRatio": 2.0,
    "minCollateralValue": 50000
  }
}
```

### 2. Coin Information
Get detailed information about a creator coin.

**Endpoint:** `GET /api/zora/coin-info?address=0x...&chainId=8453`

**Response:**
```json
{
  "success": true,
  "coin": {
    "id": "...",
    "name": "Creator Coin",
    "description": "...",
    "address": "0x...",
    "symbol": "CC",
    "totalSupply": "1000000",
    "marketCap": "50000",
    "priceInUsdc": "0.50",
    "uniqueHolders": 150,
    "creatorAddress": "0x...",
    "chainId": 8453,
    "creatorProfile": {
      "id": "...",
      "handle": "@creator",
      "avatar": {...},
      "socialAccounts": {...}
    },
    "mediaContent": {
      "mimeType": "image/png",
      "originalUri": "...",
      "previewImage": {...}
    }
  }
}
```

## Loan Eligibility Criteria

The system automatically calculates loan eligibility based on:

### Minimum Requirements
- **Market Cap**: $10,000 minimum
- **Unique Holders**: At least 10 holders
- **Token Price**: At least $0.01 per token

### Loan Calculations
- **Max Loan Amount**: 50% of market cap (capped at $100,000)
- **Collateral Ratio**: 200% (2x the loan amount)
- **Min Collateral Value**: Loan amount × 2

### Example
If a creator coin has:
- Market Cap: $50,000
- Price: $0.50 per token
- Unique Holders: 150

Then:
- ✅ Eligible for loan
- Max Loan: $25,000 (50% of $50,000)
- Required Collateral Value: $50,000 (200% of $25,000)
- Required Collateral Tokens: 100,000 tokens ($50,000 ÷ $0.50)

## Zora API Functions

### Available in `src/lib/services/zoraApi.ts`

#### 1. `getCreatorCoin(coinAddress, chainId)`
Get detailed information about a creator coin.

```typescript
import { getCreatorCoin } from "@/lib/services/zoraApi";

const coinData = await getCreatorCoin("0x...", 8453);
console.log(coinData.zora20Token.name);
```

#### 2. `getCoinHolders(coinAddress, chainId, count, after)`
Get list of token holders.

```typescript
import { getCoinHolders } from "@/lib/services/zoraApi";

const holders = await getCoinHolders("0x...", 8453, 25);
console.log(holders.zora20Token.tokenBalances.count);
```

#### 3. `validateUserCoinOwnership(coinAddress, userAddress, chainId)`
Check if user owns the coin and get their balance.

```typescript
import { validateUserCoinOwnership } from "@/lib/services/zoraApi";

const validation = await validateUserCoinOwnership("0x...", "0x...", 8453);
if (validation.isValid) {
  console.log(`User owns ${validation.balanceDecimal} tokens`);
}
```

#### 4. `getMultipleCoins(coins)`
Get data for multiple coins at once.

```typescript
import { getMultipleCoins } from "@/lib/services/zoraApi";

const coins = await getMultipleCoins([
  { address: "0x...", chainId: 8453 },
  { address: "0x...", chainId: 8453 },
]);
```

#### 5. `getCreatorProfile(identifier, chainIds)`
Get creator profile and their coins.

```typescript
import { getCreatorProfile } from "@/lib/services/zoraApi";

const profile = await getCreatorProfile("@creator", [8453]);
console.log(profile.profile.createdCoins);
```

#### 6. `calculateLoanEligibility(coinData)`
Calculate loan eligibility based on coin data.

```typescript
import { calculateLoanEligibility } from "@/lib/services/zoraApi";

const eligibility = calculateLoanEligibility(coinData.zora20Token);
if (eligibility.isEligible) {
  console.log(`Max loan: $${eligibility.maxLoanAmount}`);
}
```

## Network Support

### Base Mainnet (Production)
- Chain ID: `8453`
- Use for real creator coins
- Real USDC payments

### Base Sepolia (Testnet)
- Chain ID: `84532`
- Use for testing
- Test tokens only

## Integration in Components

### In DepositCollateral Component

The `DepositCollateral` component now uses real Zora validation:

```tsx
// Automatically validates via Zora API
const response = await fetch("/api/zora/validate-coin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    coinAddress: creatorCoinAddress,
    userAddress: evmAddress,
  }),
});

const data = await response.json();

if (data.isValid) {
  // User owns the coin!
  console.log(`Balance: ${data.balance} tokens`);
  console.log(`Market Cap: $${data.coinData.marketCap}`);
  
  if (data.loanEligibility.isEligible) {
    console.log(`Max Loan: $${data.loanEligibility.maxLoanAmount}`);
  }
}
```

## Error Handling

### Common Errors

#### 1. Coin Not Found
```json
{
  "error": "Creator coin not found",
  "status": 404
}
```
**Solution**: Verify the coin address is correct and exists on the specified chain.

#### 2. User Doesn't Own Coin
```json
{
  "isValid": false,
  "balance": 0,
  "message": "You do not own this creator coin or have insufficient balance"
}
```
**Solution**: User needs to purchase the creator coin first.

#### 3. API Rate Limit
```json
{
  "error": "Rate limit exceeded",
  "status": 429
}
```
**Solution**: Implement caching or reduce API call frequency.

## Best Practices

### 1. Cache Coin Data
Cache coin information to reduce API calls:

```typescript
// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
const coinCache = new Map();

async function getCachedCoinData(address: string) {
  const cached = coinCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await getCreatorCoin(address);
  coinCache.set(address, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Validate Before Loan Application
Always validate coin ownership before allowing loan application:

```typescript
// In loan application form
const handleSubmit = async () => {
  // First, validate coin ownership
  const validation = await validateUserCoinOwnership(
    coinAddress,
    userAddress
  );
  
  if (!validation.isValid) {
    alert("You must own this creator coin to apply for a loan");
    return;
  }
  
  if (!validation.coinData) {
    alert("Unable to fetch coin data");
    return;
  }
  
  const eligibility = calculateLoanEligibility(validation.coinData);
  
  if (!eligibility.isEligible) {
    alert(`This coin doesn't meet eligibility criteria:
      - Market Cap: $${eligibility.marketCapUSD} (min: $10,000)
      - Holders: ${eligibility.uniqueHolders} (min: 10)
      - Price: $${eligibility.priceInUSDC} (min: $0.01)
    `);
    return;
  }
  
  // Proceed with loan application
  submitLoanApplication({
    ...formData,
    maxLoanAmount: eligibility.maxLoanAmount,
    requiredCollateral: eligibility.minCollateralValue,
  });
};
```

### 3. Display Coin Information
Show users detailed coin information:

```tsx
{coinData && (
  <div className="coin-info">
    <h3>{coinData.name} ({coinData.symbol})</h3>
    <p>Market Cap: ${coinData.marketCap}</p>
    <p>Price: ${coinData.priceInUsdc}</p>
    <p>Holders: {coinData.uniqueHolders}</p>
    <p>Your Balance: {balance} tokens</p>
    
    {loanEligibility && (
      <div className="loan-info">
        <h4>Loan Eligibility</h4>
        <p>Max Loan: ${loanEligibility.maxLoanAmount}</p>
        <p>Required Collateral: ${loanEligibility.minCollateralValue}</p>
      </div>
    )}
  </div>
)}
```

## Testing

### Test with Real Creator Coins

1. Find a creator coin on Base:
   - Visit https://zora.co
   - Browse creator coins
   - Copy the coin address

2. Test validation:
```bash
curl -X POST http://localhost:3000/api/zora/validate-coin \
  -H "Content-Type: application/json" \
  -d '{
    "coinAddress": "0x...",
    "userAddress": "0x...",
    "chainId": 8453
  }'
```

3. Test coin info:
```bash
curl http://localhost:3000/api/zora/coin-info?address=0x...&chainId=8453
```

## Monitoring

### Track API Usage

Add logging to monitor Zora API calls:

```typescript
// In zoraApi.ts
const logApiCall = (endpoint: string, params: any) => {
  console.log(`[Zora API] ${endpoint}`, {
    timestamp: new Date().toISOString(),
    params,
  });
};

// Use in functions
export async function getCreatorCoin(coinAddress: string, chainId: number) {
  logApiCall("getCreatorCoin", { coinAddress, chainId });
  // ... rest of function
}
```

## Next Steps

1. **Test with real coins** on Base mainnet
2. **Implement caching** to reduce API calls
3. **Add error retry logic** for failed requests
4. **Monitor API usage** and optimize calls
5. **Add analytics** to track coin validation success rates

## Support

- **Zora Docs**: https://docs.zora.co
- **Zora Discord**: https://discord.gg/zora
- **API Status**: Check Zora status page

---

**Your platform now has full Zora API integration!** 🎉
