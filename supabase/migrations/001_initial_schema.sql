-- Creator Loan Platform Database Schema
-- Migration: Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  wallet_address TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_coin_address TEXT UNIQUE NOT NULL,
  requested_amount DECIMAL(18, 2) NOT NULL,
  loan_purpose TEXT NOT NULL,
  collateral_amount DECIMAL(18, 2) NOT NULL,
  collateral_type TEXT DEFAULT 'CREATOR_COIN',
  duration_months INTEGER NOT NULL,
  interest_rate DECIMAL(5, 2),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'FUNDED')),
  risk_score DECIMAL(5, 2),
  monthly_income DECIMAL(18, 2),
  employment_status TEXT,
  credit_score INTEGER,
  loan_id UUID UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_coin_address TEXT NOT NULL,
  principal_amount DECIMAL(18, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  duration_months INTEGER NOT NULL,
  monthly_payment DECIMAL(18, 2) NOT NULL,
  total_amount DECIMAL(18, 2) NOT NULL,
  collateral_amount DECIMAL(18, 2) NOT NULL,
  collateral_type TEXT DEFAULT 'CREATOR_COIN',
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAID', 'DEFAULTED', 'RESTRUCTURED', 'PENDING_COLLATERAL')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  next_payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  remaining_balance DECIMAL(18, 2) NOT NULL,
  interest_accrued DECIMAL(18, 2) DEFAULT 0,
  late_fees DECIMAL(18, 2) DEFAULT 0,
  contract_address TEXT,
  transaction_hash TEXT,
  loan_to_value DECIMAL(5, 4) DEFAULT 0.10,
  collateral_ratio DECIMAL(5, 4) DEFAULT 0.20,
  metadata JSONB,
  loan_application_id UUID UNIQUE REFERENCES loan_applications(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repayments table
CREATE TABLE IF NOT EXISTS repayments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(18, 2) NOT NULL,
  principal_amount DECIMAL(18, 2) NOT NULL,
  interest_amount DECIMAL(18, 2) NOT NULL,
  late_fee_amount DECIMAL(18, 2) DEFAULT 0,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'PAID' CHECK (status IN ('PAID', 'PENDING', 'LATE', 'PARTIAL')),
  transaction_hash TEXT,
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server Wallets table
CREATE TABLE IF NOT EXISTS server_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL,
  private_key TEXT NOT NULL, -- Should be encrypted
  wallet_type TEXT DEFAULT 'HOT' CHECK (wallet_type IN ('HOT', 'COLD')),
  purpose TEXT DEFAULT 'LENDING' CHECK (purpose IN ('LENDING', 'COLLATERAL', 'OPERATIONS')),
  chain_id INTEGER DEFAULT 8453,
  balance DECIMAL(18, 8) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_loan_applications_applicant_id ON loan_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_creator_coin_address ON loans(creator_coin_address);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_repayments_loan_id ON repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_repayments_borrower_id ON repayments(borrower_id);
CREATE INDEX IF NOT EXISTS idx_repayments_payment_date ON repayments(payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_server_wallets_address ON server_wallets(address);
CREATE INDEX IF NOT EXISTS idx_server_wallets_is_active ON server_wallets(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repayments_updated_at BEFORE UPDATE ON repayments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_server_wallets_updated_at BEFORE UPDATE ON server_wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication setup)
-- For now, allow service role full access
CREATE POLICY "Service role has full access to users" ON users
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to loan_applications" ON loan_applications
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to loans" ON loans
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to repayments" ON repayments
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to server_wallets" ON server_wallets
  FOR ALL USING (true);
