import { NextRequest, NextResponse } from 'next/server'
import { ZoraAPI } from '@/lib/zora-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coinAddress, chainId = 8453 } = body

    if (!coinAddress) {
      return NextResponse.json(
        { error: 'Coin address is required' },
        { status: 400 }
      )
    }

    // Validate the creator coin using Zora API
    const validation = await ZoraAPI.validateCreatorCoin(coinAddress)

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid creator coin address',
        validation
      })
    }

    return NextResponse.json({
      success: true,
      validation,
      message: validation.eligibleForLoan 
        ? 'Coin is eligible for loan'
        : 'Coin does not meet minimum requirements'
    })

  } catch (error) {
    console.error('Error validating creator coin:', error)
    return NextResponse.json(
      { error: 'Failed to validate creator coin' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      )
    }

    // Get user's eligible coin holdings
    const holdings = await ZoraAPI.getUserCoinHoldings(userAddress)

    return NextResponse.json({
      success: true,
      holdings,
      totalEligibleValue: holdings.reduce((sum, h) => sum + h.valueUSD, 0),
      totalMaxLoanAmount: holdings.reduce((sum, h) => sum + h.maxLoanAmount, 0)
    })

  } catch (error) {
    console.error('Error fetching user holdings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user holdings' },
      { status: 500 }
    )
  }
}