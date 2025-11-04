import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a single supabase client for server-side operations
// Using service role key for full database access
export const db = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Type definitions for database tables
export type User = {
  id: string
  email: string
  name: string | null
  wallet_address: string | null
  created_at: string
  updated_at: string
}

export type LoanApplication = {
  id: string
  applicant_id: string
  creator_coin_address: string
  requested_amount: number
  loan_purpose: string
  collateral_amount: number
  collateral_type: string
  duration_months: number
  interest_rate: number | null
  status: string
  risk_score: number | null
  monthly_income: number | null
  employment_status: string | null
  credit_score: number | null
  loan_id: string | null
  metadata: any
  created_at: string
  updated_at: string
}

export type Loan = {
  id: string
  borrower_id: string
  creator_coin_address: string
  principal_amount: number
  interest_rate: number
  duration_months: number
  monthly_payment: number
  total_amount: number
  collateral_amount: number
  collateral_type: string
  status: string
  start_date: string
  end_date: string
  next_payment_date: string
  remaining_balance: number
  interest_accrued: number
  late_fees: number
  contract_address: string | null
  transaction_hash: string | null
  loan_to_value: number
  collateral_ratio: number
  metadata: any
  loan_application_id: string | null
  created_at: string
  updated_at: string
}

export type Repayment = {
  id: string
  loan_id: string
  borrower_id: string
  amount: number
  principal_amount: number
  interest_amount: number
  late_fee_amount: number
  payment_date: string
  due_date: string
  status: string
  transaction_hash: string | null
  payment_method: string | null
  metadata: any
  created_at: string
  updated_at: string
}

export type ServerWallet = {
  id: string
  address: string
  private_key: string
  wallet_type: string
  purpose: string
  chain_id: number
  balance: number
  is_active: boolean
  last_used: string | null
  metadata: any
  created_at: string
  updated_at: string
}