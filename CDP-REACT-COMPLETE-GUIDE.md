# Complete CDP React Embedded Wallet Guide

## Overview

CDP React provides embedded wallet functionality with social login (email, SMS, OAuth) for seamless user onboarding. No seed phrases, no browser extensions needed.

## Installation

```bash
npm install @coinbase/cdp-react
# or
yarn add @coinbase/cdp-react
```

## Basic Setup

### 1. Wrap Your App with CDPReactProvider

```typescript
import { CDPReactProvider, type Config, type Theme } from "@coinbase/cdp-react";

const config: Config = {
  projectId: "your-project-id", // Get from https://portal.cdp.coinbase.com
  ethereum: {
    createOnLogin: "smart", // Creates smart wallet on login
  },
  appName: "Your App Name",
  appLogoUrl: "https://your-app.com/logo.png", // Optional
  authMethods: ["email", "sms", "oauth:google", "oauth:apple", "oauth:x"],
  showCoinbaseFooter: true, // Shows "Powered by Coinbase" footer
};

const theme: Partial<Theme> = {
  // Background colors
  "colors-bg-default": "#ffffff",
  "colors-bg-alternate": "#eef0f3",
  "colors-bg-primary": "#0093cb",
  "colors-bg-secondary": "#eef0f3",
  
  // Foreground/text colors
  "colors-fg-default": "#0a0b0d",
  "colors-fg-muted": "#5b616e",
  "colors-fg-primary": "#0093cb",
  "colors-fg-onPrimary": "#ffffff",
  "colors-fg-onSecondary": "#0a0b0d",
  
  // Status colors
  "colors-fg-positive": "#098551",
  "colors-fg-negative": "#cf202f",
  "colors-fg-warning": "#ed702f",
  
  // Border colors
  "colors-line-default": "#dcdfe4",
  "colors-line-heavy": "#9397a0",
  
  // Border radius
  "borderRadius-cta": "var(--cdp-web-borderRadius-md)",
  "borderRadius-link": "var(--cdp-web-borderRadius-md)",
  "borderRadius-input": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-select-trigger": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-select-list": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-modal": "var(--cdp-web-borderRadius-sm)",
  
  // Typography
  "font-family-sans": "'Inter', 'Helvetica', 'Arial', sans-serif",
};

export default function App() {
  return (
    <CDPReactProvider config={config} theme={theme}>
      {/* Your app components */}
    </CDPReactProvider>
  );
}
```

## Components

### AuthButton

Pre-built authentication button that handles the entire auth flow.

```typescript
import { AuthButton } from "@coinbase/cdp-react";

function MyComponent() {
  return <AuthButton />;
}
```

**Features:**
- Shows "Sign In" when disconnected
- Shows wallet address when connected
- Opens authentication modal on click
- Handles all auth methods automatically
- Provides disconnect functionality

### Custom Styling

```typescript
// Wrap in a container for custom styling
<div className="my-custom-auth">
  <AuthButton />
</div>
```

## Hooks

### useAccount

Access connected wallet information.

```typescript
import { useAccount } from "@coinbase/cdp-react";

function MyComponent() {
  const { address, isConnected, isConnecting } = useAccount();

  if (isConnecting) {
    return <div>Connecting...</div>;
  }

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
    </div>
  );
}
```

**Returns:**
- `address`: string | undefined - Wallet address
- `isConnected`: boolean - Connection status
- `isConnecting`: boolean - Loading state

### useConnect

Programmatically trigger wallet connection.

```typescript
import { useConnect } from "@coinbase/cdp-react";

function MyComponent() {
  const { connect, isConnecting } = useConnect();

  return (
    <button onClick={() => connect()} disabled={isConnecting}>
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
```

**Returns:**
- `connect`: () => void - Function to open auth modal
- `isConnecting`: boolean - Loading state

### useDisconnect

Disconnect the current wallet.

```typescript
import { useDisconnect } from "@coinbase/cdp-react";

function MyComponent() {
  const { disconnect } = useDisconnect();

  return (
    <button onClick={() => disconnect()}>
      Disconnect
    </button>
  );
}
```

### useSendTransaction

Send transactions from the connected wallet.

```typescript
import { useSendTransaction } from "@coinbase/cdp-react";

function MyComponent() {
  const { sendTransaction, isPending } = useSendTransaction();

  const handleSend = async () => {
    try {
      const hash = await sendTransaction({
        to: "0x...",
        value: "1000000000000000000", // 1 ETH in wei
        data: "0x", // Optional contract data
      });
      console.log("Transaction hash:", hash);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <button onClick={handleSend} disabled={isPending}>
      {isPending ? "Sending..." : "Send Transaction"}
    </button>
  );
}
```

### useSignMessage

Sign messages with the connected wallet.

```typescript
import { useSignMessage } from "@coinbase/cdp-react";

function MyComponent() {
  const { signMessage, isPending } = useSignMessage();

  const handleSign = async () => {
    try {
      const signature = await signMessage({
        message: "Hello, World!",
      });
      console.log("Signature:", signature);
    } catch (error) {
      console.error("Signing failed:", error);
    }
  };

  return (
    <button onClick={handleSign} disabled={isPending}>
      {isPending ? "Signing..." : "Sign Message"}
    </button>
  );
}
```

### useBalance

Get wallet balance.

```typescript
import { useBalance } from "@coinbase/cdp-react";

function MyComponent() {
  const { data: balance, isLoading } = useBalance();

  if (isLoading) return <div>Loading balance...</div>;

  return (
    <div>
      Balance: {balance?.formatted} {balance?.symbol}
    </div>
  );
}
```

## Configuration Options

### Config Type

```typescript
type Config = {
  projectId: string;                    // Required: Your CDP project ID
  ethereum?: {
    createOnLogin?: "smart" | "eoa";    // Wallet type to create
    chainId?: number;                   // Default chain ID
  };
  appName?: string;                     // Your app name
  appLogoUrl?: string;                  // Your app logo URL
  authMethods?: AuthMethod[];           // Available auth methods
  showCoinbaseFooter?: boolean;         // Show Coinbase branding
};

type AuthMethod = 
  | "email"
  | "sms"
  | "oauth:google"
  | "oauth:apple"
  | "oauth:x"
  | "oauth:github"
  | "oauth:discord";
```

### Theme Type

```typescript
type Theme = {
  // Background colors
  "colors-bg-default": string;
  "colors-bg-alternate": string;
  "colors-bg-primary": string;
  "colors-bg-secondary": string;
  
  // Foreground colors
  "colors-fg-default": string;
  "colors-fg-muted": string;
  "colors-fg-primary": string;
  "colors-fg-onPrimary": string;
  "colors-fg-onSecondary": string;
  "colors-fg-positive": string;
  "colors-fg-negative": string;
  "colors-fg-warning": string;
  
  // Border colors
  "colors-line-default": string;
  "colors-line-heavy": string;
  
  // Border radius
  "borderRadius-cta": string;
  "borderRadius-link": string;
  "borderRadius-input": string;
  "borderRadius-select-trigger": string;
  "borderRadius-select-list": string;
  "borderRadius-modal": string;
  
  // Typography
  "font-family-sans": string;
};
```

## Authentication Methods

### Email
Users receive a verification code via email.

```typescript
authMethods: ["email"]
```

### SMS
Users receive a verification code via SMS.

```typescript
authMethods: ["sms"]
```

### OAuth Providers
Users sign in with their social accounts.

```typescript
authMethods: [
  "oauth:google",   // Google
  "oauth:apple",    // Apple
  "oauth:x",        // X (Twitter)
  "oauth:github",   // GitHub
  "oauth:discord"   // Discord
]
```

## Complete Example

```typescript
"use client";

import { 
  CDPReactProvider, 
  AuthButton,
  useAccount,
  useConnect,
  useDisconnect,
  type Config, 
  type Theme 
} from "@coinbase/cdp-react";

// Configuration
const config: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
  ethereum: {
    createOnLogin: "smart",
  },
  appName: "My DApp",
  appLogoUrl: "https://myapp.com/logo.png",
  authMethods: ["email", "sms", "oauth:google", "oauth:apple"],
  showCoinbaseFooter: true,
};

// Theme
const theme: Partial<Theme> = {
  "colors-bg-default": "#ffffff",
  "colors-bg-primary": "#0052ff",
  "colors-fg-default": "#0a0b0d",
  "colors-fg-primary": "#0052ff",
  "font-family-sans": "'Inter', sans-serif",
};

// Dashboard Component
function Dashboard() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <div>
        <h1>Welcome!</h1>
        <AuthButton />
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Connected: {address}</p>
      <button onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  );
}

// App Component
export default function App() {
  return (
    <CDPReactProvider config={config} theme={theme}>
      <Dashboard />
    </CDPReactProvider>
  );
}
```

## Advanced Usage

### Protected Routes

```typescript
import { useAccount } from "@coinbase/cdp-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function ProtectedPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return <div>Redirecting...</div>;
  }

  return <div>Protected Content</div>;
}
```

### Custom Connect Button

```typescript
import { useConnect, useAccount } from "@coinbase/cdp-react";

function CustomConnectButton() {
  const { connect, isConnecting } = useConnect();
  const { address, isConnected } = useAccount();

  if (isConnected) {
    return (
      <div className="wallet-info">
        <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
      </div>
    );
  }

  return (
    <button 
      onClick={() => connect()} 
      disabled={isConnecting}
      className="connect-button"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
```

### Transaction with Gas Sponsorship

```typescript
import { useSendTransaction } from "@coinbase/cdp-react";

function SendWithGasSponsorship() {
  const { sendTransaction } = useSendTransaction();

  const handleSend = async () => {
    try {
      const hash = await sendTransaction({
        to: "0x...",
        value: "1000000000000000000",
        // Gas will be sponsored if configured in CDP Portal
      });
      console.log("Transaction hash:", hash);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return <button onClick={handleSend}>Send</button>;
}
```

## Error Handling

```typescript
import { useConnect } from "@coinbase/cdp-react";
import { useState } from "react";

function ConnectWithErrorHandling() {
  const { connect } = useConnect();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setError(null);
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  return (
    <div>
      <button onClick={handleConnect}>Connect</button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Best Practices

### 1. Environment Variables
```bash
# .env.local
NEXT_PUBLIC_CDP_PROJECT_ID=your-project-id
```

### 2. Type Safety
```typescript
import type { Config, Theme } from "@coinbase/cdp-react";

const config: Config = { /* ... */ };
const theme: Partial<Theme> = { /* ... */ };
```

### 3. Loading States
```typescript
const { isConnecting } = useConnect();
const { isConnected } = useAccount();

if (isConnecting) return <Spinner />;
if (!isConnected) return <ConnectPrompt />;
return <Dashboard />;
```

### 4. Error Boundaries
```typescript
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary fallback={<ErrorFallback />}>
  <CDPReactProvider config={config}>
    <App />
  </CDPReactProvider>
</ErrorBoundary>
```

## Troubleshooting

### Issue: Modal doesn't open
**Solution:** 
- Verify `projectId` is correct
- Check CDP Portal domain allowlist
- Ensure provider wraps your app

### Issue: Authentication fails
**Solution:**
- Check network connection
- Verify auth methods are enabled in CDP Portal
- Check browser console for errors

### Issue: Wallet not persisting
**Solution:**
- Check browser local storage
- Verify cookies are enabled
- Clear cache and try again

### Issue: TypeScript errors
**Solution:**
```bash
npm install --legacy-peer-deps
# Restart TypeScript server in IDE
```

## Resources

- **CDP Portal**: https://portal.cdp.coinbase.com
- **Documentation**: https://docs.cdp.coinbase.com
- **CDP React Docs**: https://docs.cdp.coinbase.com/cdp-react
- **Base Docs**: https://docs.base.org
- **Support**: https://support.coinbase.com

## Migration from Other Wallets

### From RainbowKit
```typescript
// Before (RainbowKit)
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

// After (CDP React)
import { CDPReactProvider } from '@coinbase/cdp-react';
```

### From wagmi
```typescript
// Before (wagmi)
import { useAccount, useConnect } from 'wagmi';

// After (CDP React)
import { useAccount, useConnect } from '@coinbase/cdp-react';
```

## FAQ

**Q: Do users need a Coinbase account?**
A: No, users can sign in with email, SMS, or OAuth without a Coinbase account.

**Q: What chains are supported?**
A: Ethereum, Base, and other EVM-compatible chains.

**Q: Can I customize the auth modal?**
A: Yes, through the theme configuration.

**Q: Is gas sponsorship available?**
A: Yes, configure it in the CDP Portal.

**Q: How are keys managed?**
A: Coinbase securely manages keys using MPC technology.

**Q: Can users export their wallet?**
A: Yes, users can export their wallet from Coinbase Wallet settings.

---

## Your Implementation

Based on your setup, here's your complete configuration:

```typescript
import { CDPReactProvider, AuthButton, type Config, type Theme } from "@coinbase/cdp-react";

const config: Config = {
  projectId: "8d885400-2c82-473e-b9d0-bf5c580a9a5f",
  ethereum: {
    createOnLogin: "smart",
  },
  appName: "Creator Loan Platform",
  appLogoUrl: "",
  authMethods: ["email", "sms", "oauth:google", "oauth:apple", "oauth:x"],
  showCoinbaseFooter: true,
};

const theme: Partial<Theme> = {
  "colors-bg-default": "#020617",
  "colors-bg-alternate": "#0f172a",
  "colors-bg-primary": "#3b82f6",
  "colors-bg-secondary": "#1e293b",
  "colors-fg-default": "#ffffff",
  "colors-fg-muted": "#94a3b8",
  "colors-fg-primary": "#3b82f6",
  "colors-fg-onPrimary": "#ffffff",
  "colors-fg-onSecondary": "#ffffff",
  "colors-fg-positive": "#10b981",
  "colors-fg-negative": "#ef4444",
  "colors-fg-warning": "#f59e0b",
  "colors-line-default": "#334155",
  "colors-line-heavy": "#475569",
  "borderRadius-cta": "var(--cdp-web-borderRadius-md)",
  "borderRadius-link": "var(--cdp-web-borderRadius-md)",
  "borderRadius-input": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-select-trigger": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-select-list": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-modal": "var(--cdp-web-borderRadius-sm)",
  "font-family-sans": "'Geist Sans', 'Geist Sans Fallback'",
};

export default function App() {
  return (
    <CDPReactProvider config={config} theme={theme}>
      <AuthButton />
    </CDPReactProvider>
  );
}
```

**Your landing page is ready with embedded wallet authentication!** 🎉
