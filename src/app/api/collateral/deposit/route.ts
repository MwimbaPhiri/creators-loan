import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ZoraAPI } from '@/lib/zora-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      loanId,
      borrowerId,
      transactionHash,
      amount
    } = body

    // Validate required fields
    if (!loanId || !borrowerId || !transactionHash || !amount) {
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

    if (loan.status !== 'PENDING_COLLATERAL') {
      return NextResponse.json(
        { error: 'Loan is not waiting for collateral' },
        { status: 400 }
      )
    }

    // Verify the collateral amount matches required
    if (amount < loan.collateral_amount) {
      return NextResponse.json(
        { 
          error: 'Insufficient collateral',
          required: loan.collateral_amount,
          provided: amount
        },
        { status: 400 }
      )
    }

    // Validate the creator coin and get current market data
    const coinValidation = await ZoraAPI.validateCreatorCoin(loan.creator_coin_address)
    
    if (!coinValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid creator coin' },
        { status: 400 }
      )
    }

    // Update loan status and record the deposit
    const { data: updatedLoan, error: updateError } = await db
      .from('loans')
      .update({
        status: 'ACTIVE',
        transaction_hash: transactionHash,
        metadata: {
          collateralDeposit: {
            amount,
            transactionHash,
            depositedAt: new Date().toISOString(),
            coinMarketCap: coinValidation.marketCap,
            coinPrice: coinValidation.currentPrice,
            coinData: coinValidation.coinData
          }
        }
      })
      .eq('id', loanId)
      .select()
      .single()

    if (updateError) {
      console.error('Supabase error:', updateError)
      throw updateError
    }

    // Here you would typically:
    // 1. Transfer the creator coins to the platform wallet
    // 2. Disburse the USDC loan to the borrower
    // 3. Create a smart contract escrow if needed

    return NextResponse.json({
      success: true,
      loan: updatedLoan,
      message: 'Collateral deposited successfully. Loan is now active.',
      nextSteps: {
        step1: 'Creator coins transferred to platform wallet',
        step2: 'USDC loan disbursed to borrower',
        step3: 'First payment due in 30 days'
      }
    })

  } catch (error) {
    console.error('Error processing collateral deposit:', error)
    return NextResponse.json(
      { error: 'Failed to process collateral deposit' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const loanId = searchParams.get('loanId')

    if (!loanId) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      )
    }

    const { data: loan, error: loanError } = await db
      .from('loans')
      .select('id, creator_coin_address, collateral_amount, status, transaction_hash, metadata')
      .eq('id', loanId)
      .single()

    if (loanError || !loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    // Get current coin data
    const coinData = await ZoraAPI.getCoinData(loan.creator_coin_address)

    return NextResponse.json({
      loan,
      currentCoinData: coinData,
      collateralStatus: loan.status === 'ACTIVE' ? 'Deposited' : 'Pending',
      depositInstructions: {
        coinAddress: loan.creator_coin_address,
        requiredAmount: loan.collateral_amount,
        platformWallet: process.env.PLATFORM_WALLET_ADDRESS,
        network: 'Base (8453)',
        tokenStandard: 'ERC-20',
        coinInfo: coinData ? {
          name: coinData.name,
          symbol: coinData.symbol,
          creator: coinData.creatorProfile?.handle || coinData.creatorAddress,
          marketCap: coinData.marketCap,
          currentPrice: coinData.tokenPrice?.priceInUsdc
        } : null
      }
    })

  } catch (error) {
    console.error('Error fetching collateral info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collateral info' },
      { status: 500 }
    )
  }
}