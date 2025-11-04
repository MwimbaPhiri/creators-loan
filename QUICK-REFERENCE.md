# Quick Reference Card

## 🔑 Environment Variables

```bash
# .env.local
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=C5ajtK1blreE9A2YfFIE7hBqYc8+YkrpBfex7b6/SmusWPersBCjHSvHDUt/q3cyVL/iO8kpipXO+2DNVf1clQ==
NEXT_PUBLIC_CDP_PROJECT_ID=8d885400-2c82-473e-b9d0-bf5c580a9a5f
NEXT_PUBLIC_NETWORK=base-sepolia  # or base-mainnet
NEXT_PUBLIC_TESTNET=true          # or false
```

## 📦 Components

### Authentication
```tsx
import { SignInButton } from "@/components/auth/SignInButton";
<SignInButton />
```

### Check Auth Status
```tsx
import { useIsSignedIn, useEvmAddress } from "@coinbase/cdp-hooks";

const { isSignedIn } = useIsSignedIn();
const { evmAddress } = useEvmAddress();
```

### Deposit Collateral
```tsx
import { DepositCollateral } from "@/components/escrow/DepositCollateral";

<DepositCollateral
  loanId="loan-123"
  requiredCollateralAmount={1000}
  creatorCoinAddress="0x..."
  escrowAddress="0x..."
  onDepositSuccess={() => {}}
/>
```

### Base Pay
```tsx
import { BasePayButton } from "@/components/payments/BasePayButton";

<BasePayButton
  amount="100.00"
  recipientAddress="0x..."
  loanId="loan-123"
  onSuccess={(paymentId, txHash) => {}}
  onError={(error) => {}}
/>
```

## 🔧 Server Functions

### Create Escrow
```typescript
import { createLoanEscrowAccount } from "@/lib/services/serverWallet";

const account = await createLoanEscrowAccount("loan-123");
console.log(account.address);
```

### Check Balance
```typescript
import { getEscrowBalance } from "@/lib/services/serverWallet";

const balance = await getEscrowBalance(address, "base-mainnet");
```

### Send from Escrow
```typescript
import { sendFromEscrow } from "@/lib/services/serverWallet";

await sendFromEscrow({
  fromAddress: escrowAddress,
  toAddress: userAddress,
  amount: BigInt("1000000000000000000"),
  network: "base-mainnet",
});
```

## 🌐 API Endpoints

### POST /api/escrow/create
```json
Request:  { "loanId": "loan-123" }
Response: { "escrowAddress": "0x...", "loanId": "loan-123" }
```

### POST /api/escrow/confirm-deposit
```json
Request:  { "loanId": "loan-123", "txHash": "0x...", "amount": "1000" }
Response: { "success": true }
```

### POST /api/zora/validate-coin
```json
Request:  { "coinAddress": "0x...", "userAddress": "0x..." }
Response: { "isValid": true, "balance": 100 }
```

### POST /api/payments/process-repayment
```json
Request:  { "loanId": "loan-123", "paymentId": "pay_...", "amount": "100", "borrowerAddress": "0x..." }
Response: { "success": true, "releaseTransactionHash": "0x..." }
```

## 🧪 Test Resources

### Faucets
- **ETH**: https://portal.cdp.coinbase.com/products/faucet
- **USDC**: https://faucet.circle.com (Base Sepolia)

### Explorers
- **Testnet**: https://sepolia.basescan.org
- **Mainnet**: https://basescan.org

### Portals
- **CDP**: https://portal.cdp.coinbase.com
- **Base**: https://base.org

## 🔄 Loan States

```
PENDING → COLLATERAL_DEPOSITED → APPROVED → ACTIVE → REPAYING → COMPLETED
```

## 💡 Common Patterns

### Conditional Rendering
```tsx
{isSignedIn ? <Dashboard /> : <SignInButton />}
```

### Transaction Handling
```tsx
onSuccess={(paymentId, txHash) => {
  toast({ title: "Success!" });
  updateDatabase(loanId, txHash);
}}
```

### Error Handling
```tsx
onError={(error) => {
  console.error(error);
  toast({ title: "Error", description: error.message });
}}
```

## 🎯 Networks

### Base Sepolia (Testnet)
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org

### Base Mainnet (Production)
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org

## 📝 TypeScript Types

### Loan
```typescript
interface Loan {
  id: string;
  escrowAddress: string;
  creatorCoinAddress: string;
  principalAmount: number;
  collateralAmount: number;
  status: string;
}
```

### Payment
```typescript
interface Payment {
  id: string;
  loanId: string;
  amount: number;
  txHash: string;
  timestamp: Date;
}
```

## ⚡ Quick Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check TypeScript
npx tsc --noEmit

# Run linter
npm run lint
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Restart TypeScript server |
| Invalid API key | Check `.env.local` |
| Domain not allowed | Add to CDP Portal |
| Transaction failed | Check network & balance |

## 📞 Support

- **CDP Docs**: https://docs.cdp.coinbase.com
- **Discord**: https://discord.gg/cdp
- **Email**: support@coinbase.com

---

**Keep this card handy for quick reference!** 📌
