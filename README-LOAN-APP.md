# Creator Coin Loan Application

A comprehensive loan application built with Next.js 15 that allows users to get loans backed by their creator coins on Base blockchain. The application integrates with Base Pay for payments, server wallets for fund management, and Zora for creator coin creation and management.

## Features

### 🏦 Core Loan Functionality
- **Loan Applications**: Apply for loans using creator coins as collateral
- **Risk Assessment**: AI-powered risk scoring and interest rate calculation
- **Loan Management**: Track active loans, payments, and repayment schedules
- **Real-time Updates**: WebSocket integration for live loan status updates

### 💰 Payment Integration
- **Base Pay Integration**: Process disbursements and repayments
- **Server Wallets**: Secure wallet management for lending operations
- **Transaction Tracking**: Complete payment history and status

### 🪙 Creator Coin Support
- **Zora Integration**: Create and manage creator coins
- **Collateral Valuation**: Real-time price tracking and market data
- **Portfolio Management**: Track creator coin value and utilization

### 📊 Dashboard & Analytics
- **Portfolio Overview**: Total borrowed, collateral value, credit score
- **Payment Tracking**: Upcoming payments, late fees, early payoff options
- **Risk Metrics**: LTV ratios, DTI calculations, credit analysis

## Technology Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** components
- **Lucide React** icons
- **Socket.io Client** for real-time updates

### Backend
- **Next.js API Routes** for serverless functions
- **Prisma ORM** with SQLite database
- **Socket.io** for WebSocket connections
- **Ethers.js** for blockchain interactions
- **ZAI SDK** for AI-powered risk assessment

### Integrations
- **Base Pay** for payment processing
- **Zora API** for creator coin management
- **Base Network** (Chain ID: 8453) for blockchain operations

## Database Schema

### Core Models
- **User**: User profiles and wallet addresses
- **CreatorCoin**: Creator coin information and market data
- **LoanApplication**: Loan applications with risk assessment
- **Loan**: Active loans with terms and repayment schedules
- **Repayment**: Payment history and transaction records
- **ServerWallet**: Server-side wallet management
- **CollateralValue**: Historical price tracking

## API Endpoints

### Loans
- `GET /api/loans` - Fetch loans (supports filtering by userId, status)
- `POST /api/loans` - Create new loan from application

### Applications
- `GET /api/applications` - Fetch loan applications
- `POST /api/applications` - Submit new loan application

### Creator Coins
- `GET /api/creator-coins` - Fetch creator coins
- `POST /api/creator-coins` - Create new creator coin via Zora

### Repayments
- `GET /api/repayments` - Fetch payment history
- `POST /api/repayments` - Process loan repayment

### Payments
- `GET /api/payments` - Fetch payment history
- `POST /api/payments` - Process Base Pay payments

### Wallets
- `GET /api/wallets` - Fetch server wallets
- `POST /api/wallets` - Create new server wallet

## Key Components

### LoanStatusTracker
Real-time loan status tracking component with WebSocket integration:
- Live payment updates
- Progress tracking
- Payment processing
- Status notifications

### Loan Calculations
Comprehensive loan calculation utilities:
- Amortization schedules
- Risk assessment algorithms
- LTV and DTI calculations
- Early payoff analysis

## Risk Assessment

The application uses AI-powered risk assessment considering:
- **LTV Ratio**: Loan-to-value ratio based on collateral
- **Credit Score**: Traditional credit scoring
- **Income Analysis**: Debt-to-income ratio
- **Employment Stability**: Employment status and history
- **Market Factors**: Creator coin market cap and volatility

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   npm run db:push
   ```

3. **Environment Variables**
   Create `.env.local` with:
   ```
   DATABASE_URL="file:./dev.db"
   ZORA_API_KEY="your-zora-api-key"
   BASE_PAY_API_KEY="your-base-pay-key"
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Usage

### Connecting Wallet
1. Click "Connect Wallet" in the header
2. Select your preferred wallet (MetaMask, Coinbase Wallet, etc.)
3. Approve connection to Base network

### Applying for Loan
1. Navigate to "Apply" tab
2. Select creator coin for collateral
3. Enter loan amount and purpose
4. Provide financial information
5. Submit application for review

### Managing Loans
1. View active loans in "My Loans" tab
2. Track real-time status updates
3. Make payments directly from the dashboard
4. Monitor progress and remaining balance

### Creator Coin Management
1. View portfolio in "Portfolio" tab
2. Track coin values and market data
3. Monitor collateral utilization
4. Create new creator coins via Zora

## Security Features

- **Server Wallets**: Encrypted private key storage
- **Risk-Based Lending**: Dynamic interest rates based on risk
- **Collateral Monitoring**: Real-time value tracking
- **Transaction Verification**: Blockchain transaction validation
- **Data Encryption**: Sensitive data protection

## Future Enhancements

- **Multi-Chain Support**: Expand beyond Base network
- **Advanced Analytics**: Enhanced reporting and insights
- **Mobile App**: React Native mobile application
- **DeFi Integration**: Yield farming and liquidity pools
- **Credit Building**: On-chain credit history

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request with description

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check documentation and API references

---

**Built with ❤️ using Next.js 15, Base, and Zora**