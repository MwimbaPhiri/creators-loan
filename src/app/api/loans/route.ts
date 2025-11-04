import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ZAI } from 'z-ai-web-dev-sdk'
import { ZoraAPI } from '@/lib/zora-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let query = db
      .from('loans')
      .select(`
        *,
        borrower:users!borrower_id (
          id,
          email,
          name,
          wallet_address
        ),
        repayments (
          *
        )
      `)
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('borrower_id', userId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data: loansData, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Sort repayments and limit to 5 for each loan
    const loans = loansData?.map(loan => ({
      ...loan,
      repayments: loan.repayments
        ?.sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
        .slice(0, 5) || []
    }))

    return NextResponse.json({ loans })
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      borrowerId,
      creatorCoinAddress,
      principalAmount,
      durationMonths,
      applicationId
    } = body

    // Validate required fields
    if (!borrowerId || !creatorCoinAddress || !principalAmount || !durationMonths) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get creator coin validation
    const coinValidation = await ZoraAPI.validateCreatorCoin(creatorCoinAddress)

    if (!coinValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid creator coin' },
        { status: 404 }
      )
    }

    // Calculate loan terms based on 10% LTV and 20% collateral
    const loanToValue = 0.10 // 10% loan-to-value
    const collateralRatio = 0.20 // 20% collateral required
    const baseRate = 5.0 // Lower base rate for creator coin loans
    
    // Calculate interest rate based on risk factors
    const riskPremium = calculateRiskPremium(principalAmount, coinValidation.marketCap)
    const interestRate = baseRate + riskPremium

    // Calculate loan terms
    const monthlyRate = interestRate / 100 / 12
    const monthlyPayment = principalAmount * (monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / (Math.pow(1 + monthlyRate, durationMonths) - 1)
    const totalAmount = monthlyPayment * durationMonths

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + durationMonths)
    
    const nextPaymentDate = new Date(startDate)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

    // Create loan
    const { data: loan, error: createError } = await db
      .from('loans')
      .insert({
        borrower_id: borrowerId,
        creator_coin_address: creatorCoinAddress,
        principal_amount: parseFloat(principalAmount),
        interest_rate: interestRate,
        duration_months: parseInt(durationMonths),
        monthly_payment: parseFloat(monthlyPayment.toFixed(2)),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        collateral_amount: coinValidation.requiredCollateral,
        collateral_type: 'CREATOR_COIN',
        status: 'PENDING_COLLATERAL',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        next_payment_date: nextPaymentDate.toISOString(),
        remaining_balance: parseFloat(principalAmount),
        loan_to_value: loanToValue,
        collateral_ratio: collateralRatio,
        loan_application_id: applicationId
      })
      .select(`
        *,
        borrower:users!borrower_id (
          id,
          email,
          name,
          wallet_address
        )
      `)
      .single()

    if (createError) {
      console.error('Supabase error:', createError)
      throw createError
    }

    // Update application status if provided
    if (applicationId) {
      await db
        .from('loan_applications')
        .update({ status: 'APPROVED' })
        .eq('id', applicationId)
    }

    return NextResponse.json({ 
      loan,
      coinValidation,
      message: 'Loan created. Awaiting collateral deposit.'
    })
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    )
  }
}

function calculateRiskPremium(principalAmount: number, marketCap: number): number {
  let premium = 0

  // Market cap risk (lower risk for higher market cap)
  if (marketCap < 25000) premium += 2
  else if (marketCap < 50000) premium += 1
  else if (marketCap > 100000) premium -= 0.5

  // Loan size risk
  if (principalAmount > 10000) premium += 1
  else if (principalAmount > 5000) premium += 0.5

  return Math.max(0, premium)
}