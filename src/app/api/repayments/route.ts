import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const loanId = searchParams.get('loanId')
    const borrowerId = searchParams.get('borrowerId')

    let query = db
      .from('repayments')
      .select(`
        *,
        loan:loans!loan_id (
          id,
          principal_amount,
          interest_rate,
          status,
          borrower_id
        ),
        borrower:users!borrower_id (
          id,
          email,
          name,
          wallet_address
        )
      `)
      .order('payment_date', { ascending: false })
    
    if (loanId) {
      query = query.eq('loan_id', loanId)
    } else if (borrowerId) {
      query = query.eq('borrower_id', borrowerId)
    }

    const { data: repayments, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ repayments })
  } catch (error) {
    console.error('Error fetching repayments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repayments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      loanId,
      borrowerId,
      amount,
      paymentMethod = 'CRYPTO',
      transactionHash
    } = body

    // Validate required fields
    if (!loanId || !borrowerId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get loan details
    const { data: loan, error: loanError } = await db
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single()

    if (loanError || !loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    if (loan.borrower_id !== borrowerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Calculate payment breakdown
    const monthlyInterest = loan.remaining_balance * (loan.interest_rate / 100 / 12)
    let principalAmount = Math.min(amount - monthlyInterest, loan.remaining_balance)
    let interestAmount = monthlyInterest
    let lateFeeAmount = 0

    // Check for late payment
    const today = new Date()
    const dueDate = new Date(loan.next_payment_date)
    
    if (today > dueDate) {
      const daysLate = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      lateFeeAmount = loan.monthly_payment * 0.05 * Math.min(daysLate / 30, 1) // 5% late fee max
      principalAmount = Math.max(0, amount - interestAmount - lateFeeAmount)
    }

    // If payment is less than interest, apply all to interest
    if (amount < interestAmount + lateFeeAmount) {
      interestAmount = amount - lateFeeAmount
      principalAmount = 0
    }

    // Create repayment record
    const { data: repayment, error: repaymentError } = await db
      .from('repayments')
      .insert({
        loan_id: loanId,
        borrower_id: borrowerId,
        amount: parseFloat(amount),
        principal_amount: principalAmount,
        interest_amount: interestAmount,
        late_fee_amount: lateFeeAmount,
        payment_date: new Date().toISOString(),
        due_date: loan.next_payment_date,
        status: 'PAID',
        transaction_hash: transactionHash,
        payment_method: paymentMethod
      })
      .select(`
        *,
        loan:loans!loan_id (
          id,
          principal_amount,
          interest_rate,
          status,
          monthly_payment,
          next_payment_date
        ),
        borrower:users!borrower_id (
          id,
          email,
          name,
          wallet_address
        )
      `)
      .single()

    if (repaymentError) {
      console.error('Supabase error:', repaymentError)
      throw repaymentError
    }

    // Update loan balance and next payment date
    const newRemainingBalance = loan.remaining_balance - principalAmount
    const isPaidOff = newRemainingBalance <= 0

    // Calculate next payment date
    const nextPaymentDate = new Date(loan.next_payment_date)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

    await db
      .from('loans')
      .update({
        remaining_balance: Math.max(0, newRemainingBalance),
        interest_accrued: loan.interest_accrued + interestAmount,
        late_fees: loan.late_fees + lateFeeAmount,
        next_payment_date: isPaidOff ? null : nextPaymentDate.toISOString(),
        status: isPaidOff ? 'PAID' : 'ACTIVE'
      })
      .eq('id', loanId)

    return NextResponse.json({ repayment })
  } catch (error) {
    console.error('Error creating repayment:', error)
    return NextResponse.json(
      { error: 'Failed to create repayment' },
      { status: 500 }
    )
  }
}