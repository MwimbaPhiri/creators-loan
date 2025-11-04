# Supabase Migration Guide

## Overview

This project has been migrated from **Prisma ORM** to **Supabase** for direct PostgreSQL database access. This guide explains the changes and how to set up your database.

## What Changed

### Removed
- ❌ `@prisma/client` package
- ❌ `prisma` package
- ❌ `prisma/schema.prisma` file
- ❌ Prisma CLI commands (`db:push`, `db:generate`, etc.)
- ❌ Prisma folder and configuration

### Added
- ✅ Direct Supabase client integration
- ✅ SQL migration file (`supabase/migrations/001_initial_schema.sql`)
- ✅ TypeScript types for all database tables
- ✅ Row Level Security (RLS) policies
- ✅ Database triggers for `updated_at` fields

## Database Schema

### Tables

#### 1. **users**
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | Unique email address |
| name | TEXT | User's name (optional) |
| wallet_address | TEXT | Blockchain wallet address (unique) |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

#### 2. **loan_applications**
Stores loan application submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| applicant_id | UUID | Foreign key to users |
| creator_coin_address | TEXT | Zora coin contract address (unique) |
| requested_amount | DECIMAL | Loan amount requested |
| loan_purpose | TEXT | Purpose of the loan |
| collateral_amount | DECIMAL | Required collateral |
| collateral_type | TEXT | Type of collateral (default: CREATOR_COIN) |
| duration_months | INTEGER | Loan duration |
| interest_rate | DECIMAL | Calculated interest rate |
| status | TEXT | PENDING, APPROVED, REJECTED, FUNDED |
| risk_score | DECIMAL | AI-calculated risk score |
| monthly_income | DECIMAL | Applicant's monthly income |
| employment_status | TEXT | Employment status |
| credit_score | INTEGER | Credit score |
| loan_id | UUID | Associated loan ID |
| metadata | JSONB | Additional data |
| created_at | TIMESTAMP | Application submission time |
| updated_at | TIMESTAMP | Last update time |

#### 3. **loans**
Stores active and completed loans.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| borrower_id | UUID | Foreign key to users |
| creator_coin_address | TEXT | Collateral coin address |
| principal_amount | DECIMAL | Original loan amount |
| interest_rate | DECIMAL | Annual interest rate |
| duration_months | INTEGER | Loan term |
| monthly_payment | DECIMAL | Required monthly payment |
| total_amount | DECIMAL | Total amount to repay |
| collateral_amount | DECIMAL | Collateral value |
| collateral_type | TEXT | Type of collateral |
| status | TEXT | ACTIVE, PAID, DEFAULTED, RESTRUCTURED, PENDING_COLLATERAL |
| start_date | TIMESTAMP | Loan start date |
| end_date | TIMESTAMP | Loan end date |
| next_payment_date | TIMESTAMP | Next payment due date |
| remaining_balance | DECIMAL | Outstanding balance |
| interest_accrued | DECIMAL | Total interest accrued |
| late_fees | DECIMAL | Total late fees |
| contract_address | TEXT | Smart contract address |
| transaction_hash | TEXT | Blockchain transaction hash |
| loan_to_value | DECIMAL | LTV ratio (default: 0.10) |
| collateral_ratio | DECIMAL | Collateral ratio (default: 0.20) |
| metadata | JSONB | Additional data |
| loan_application_id | UUID | Associated application |
| created_at | TIMESTAMP | Loan creation time |
| updated_at | TIMESTAMP | Last update time |

#### 4. **repayments**
Stores loan repayment records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| loan_id | UUID | Foreign key to loans |
| borrower_id | UUID | Foreign key to users |
| amount | DECIMAL | Total payment amount |
| principal_amount | DECIMAL | Principal portion |
| interest_amount | DECIMAL | Interest portion |
| late_fee_amount | DECIMAL | Late fee portion |
| payment_date | TIMESTAMP | Payment date |
| due_date | TIMESTAMP | Original due date |
| status | TEXT | PAID, PENDING, LATE, PARTIAL |
| transaction_hash | TEXT | Blockchain transaction hash |
| payment_method | TEXT | Payment method used |
| metadata | JSONB | Additional data |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

#### 5. **server_wallets**
Stores server-managed wallet information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| address | TEXT | Wallet address (unique) |
| private_key | TEXT | Encrypted private key |
| wallet_type | TEXT | HOT or COLD |
| purpose | TEXT | LENDING, COLLATERAL, OPERATIONS |
| chain_id | INTEGER | Blockchain chain ID (default: 8453) |
| balance | DECIMAL | Current balance |
| is_active | BOOLEAN | Active status |
| last_used | TIMESTAMP | Last usage time |
| metadata | JSONB | Additional data |
| created_at | TIMESTAMP | Wallet creation time |
| updated_at | TIMESTAMP | Last update time |

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **New Project**
3. Choose your organization
4. Enter project details:
   - **Name**: creator-loan-platform
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
5. Click **Create new project**

### 2. Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** to execute the migration
6. Verify all tables were created in **Table Editor**

### 4. Configure Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Verify Setup

Run this test query in SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return: users, loan_applications, loans, repayments, server_wallets
```

## Code Changes

### Database Client

**Before (Prisma):**
```typescript
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
```

**After (Supabase):**
```typescript
import { createClient } from '@supabase/supabase-js'
const db = createClient(supabaseUrl, supabaseServiceKey)
```

### Query Examples

#### Create Record

**Before (Prisma):**
```typescript
const user = await db.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe'
  }
})
```

**After (Supabase):**
```typescript
const { data: user, error } = await db
  .from('users')
  .insert({
    email: 'user@example.com',
    name: 'John Doe'
  })
  .select()
  .single()
```

#### Find Records

**Before (Prisma):**
```typescript
const loans = await db.loan.findMany({
  where: { borrowerId: userId },
  include: { borrower: true }
})
```

**After (Supabase):**
```typescript
const { data: loans, error } = await db
  .from('loans')
  .select(`
    *,
    borrower:users!borrower_id (*)
  `)
  .eq('borrower_id', userId)
```

#### Update Record

**Before (Prisma):**
```typescript
await db.loan.update({
  where: { id: loanId },
  data: { status: 'PAID' }
})
```

**After (Supabase):**
```typescript
await db
  .from('loans')
  .update({ status: 'PAID' })
  .eq('id', loanId)
```

## Benefits of Supabase

### 1. **Direct PostgreSQL Access**
- No ORM overhead
- Full SQL capabilities
- Better performance

### 2. **Row Level Security (RLS)**
- Built-in security policies
- User-level data isolation
- Automatic enforcement

### 3. **Real-time Subscriptions**
```typescript
// Listen to loan updates
const subscription = db
  .from('loans')
  .on('UPDATE', payload => {
    console.log('Loan updated:', payload)
  })
  .subscribe()
```

### 4. **Built-in Features**
- Authentication
- Storage
- Edge Functions
- Realtime
- Vector embeddings

### 5. **Better Scalability**
- Automatic connection pooling
- Read replicas
- Point-in-time recovery
- Automatic backups

## Troubleshooting

### Issue: "relation does not exist"
**Solution:** Run the migration SQL file in Supabase SQL Editor

### Issue: "permission denied"
**Solution:** Check you're using the service_role key for server-side operations

### Issue: "column does not exist"
**Solution:** Verify column names use snake_case (e.g., `borrower_id` not `borrowerId`)

### Issue: RLS blocking queries
**Solution:** Policies are set to allow service_role full access. Check your key configuration.

## Migration Checklist

- [x] Remove Prisma dependencies from package.json
- [x] Delete prisma folder and schema
- [x] Create Supabase SQL migration file
- [x] Update db.ts to use Supabase client
- [x] Migrate all API routes to Supabase queries
- [x] Add TypeScript types for tables
- [x] Update documentation
- [ ] Create Supabase project
- [ ] Run database migration
- [ ] Configure environment variables
- [ ] Test all API endpoints
- [ ] Verify data operations work

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

For issues or questions:
1. Check Supabase dashboard logs
2. Review SQL migration file
3. Verify environment variables
4. Test with Supabase SQL Editor
5. Contact Supabase support
