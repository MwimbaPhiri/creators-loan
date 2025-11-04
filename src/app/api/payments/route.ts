import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type, // 'DISBURSEMENT' or 'REPAYMENT'
      amount,
      recipientAddress,
      loanId,
      metadata = {}
    } = body

    // Validate required fields
    if (!type || !amount || !recipientAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, recipientAddress' },
        { status: 400 }
      )
    }

    if (!['DISBURSEMENT', 'REPAYMENT'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid payment type. Must be DISBURSEMENT or REPAYMENT' },
        { status: 400 }
      )
    }

    // Get available server wallet
    const { data: serverWallet, error: walletError } = await db
      .from('server_wallets')
      .select('*')
      .eq('purpose', type === 'DISBURSEMENT' ? 'LENDING' : 'OPERATIONS')
      .eq('is_active', true)
      .eq('chain_id', 8453)
      .limit(1)
      .single()

    if (walletError || !serverWallet) {
      return NextResponse.json(
        { error: 'No available server wallet for payment' },
        { status: 500 }
      )
    }

    // Create payment via Base Pay
    const paymentResult = await processBasePayPayment({
      type,
      amount: parseFloat(amount),
      recipientAddress,
      senderWallet: serverWallet,
      loanId,
      metadata
    })

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: 'Payment failed', details: paymentResult.error },
        { status: 500 }
      )
    }

    // Update wallet balance (mock)
    await db
      .from('server_wallets')
      .update({
        balance: serverWallet.balance - parseFloat(amount),
        last_used: new Date().toISOString()
      })
      .eq('id', serverWallet.id)

    // If it's a disbursement, update loan status
    if (type === 'DISBURSEMENT' && loanId) {
      await db
        .from('loans')
        .update({
          status: 'ACTIVE',
          transaction_hash: paymentResult.transactionHash
        })
        .eq('id', loanId)
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.paymentId,
      transactionHash: paymentResult.transactionHash,
      amount: parseFloat(amount),
      recipientAddress,
      type,
      status: 'COMPLETED'
    })

  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

async function processBasePayPayment(paymentData: {
  type: string
  amount: number
  recipientAddress: string
  senderWallet: any
  loanId?: string
  metadata: any
}) {
  try {
    // In a real implementation, this would integrate with Base Pay API
    // For demo purposes, we'll simulate the payment process
    
    const zai = await ZAI.create()
    
    // Get payment instructions from AI
    const prompt = `
    Generate a mock Base Pay payment for:
    Type: ${paymentData.type}
    Amount: $${paymentData.amount}
    Recipient: ${paymentData.recipientAddress}
    Loan ID: ${paymentData.loanId || 'N/A'}
    
    Return a JSON response with:
    - paymentId: string
    - transactionHash: string
    - status: "COMPLETED"
    - timestamp: string
    `
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a payment processing AI. Return valid JSON responses only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 200
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    
    // Parse AI response or create mock response
    let paymentResponse
    try {
      paymentResponse = JSON.parse(responseText || '{}')
    } catch {
      paymentResponse = {
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: 'COMPLETED',
        timestamp: new Date().toISOString()
      }
    }

    return {
      success: true,
      ...paymentResponse
    }
  } catch (error) {
    console.error('Base Pay payment error:', error)
    
    // Fallback mock response
    return {
      success: true,
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: 'COMPLETED'
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const loanId = searchParams.get('loanId')
    const type = searchParams.get('type')

    // In a real implementation, this would query Base Pay API
    // For demo purposes, return mock payment history
    
    const mockPayments = [
      {
        id: 'pay_001',
        type: 'DISBURSEMENT',
        amount: 10000,
        recipientAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45',
        transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
        status: 'COMPLETED',
        createdAt: '2024-01-01T10:00:00Z',
        loanId: 'loan_001'
      },
      {
        id: 'pay_002',
        type: 'REPAYMENT',
        amount: 452.27,
        recipientAddress: '0x9876543210fedcba9876543210fedcba98765432',
        transactionHash: '0xfedcba0987654321fedcba0987654321fedcba09',
        status: 'COMPLETED',
        createdAt: '2024-02-01T10:00:00Z',
        loanId: 'loan_001'
      }
    ]

    let filteredPayments = mockPayments
    
    if (loanId) {
      filteredPayments = filteredPayments.filter(p => p.loanId === loanId)
    }
    
    if (type) {
      filteredPayments = filteredPayments.filter(p => p.type === type.toUpperCase())
    }

    return NextResponse.json({ payments: filteredPayments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}