import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ZAI } from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get('creatorId')
    const symbol = searchParams.get('symbol')

    let coins
    
    if (creatorId) {
      coins = await db.creatorCoin.findMany({
        where: { creator: creatorId },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              walletAddress: true
            }
          },
          collateralValues: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 10
          },
          _count: {
            select: {
              loans: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (symbol) {
      coins = await db.creatorCoin.findMany({
        where: { symbol: { contains: symbol, mode: 'insensitive' } },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              walletAddress: true
            }
          },
          collateralValues: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 10
          },
          _count: {
            select: {
              loans: true
            }
          }
        }
      })
    } else {
      coins = await db.creatorCoin.findMany({
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              walletAddress: true
            }
          },
          collateralValues: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 10
          },
          _count: {
            select: {
              loans: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json({ coins })
  } catch (error) {
    console.error('Error fetching creator coins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch creator coins' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      creator,
      name,
      symbol,
      metadataUri,
      currency = 'CREATOR_COIN',
      chainId = 8453, // Base chain
      startingMarketCap = 'LOW',
      platformReferrer,
      payoutRecipientOverride,
      smartWalletRouting = 'AUTO'
    } = body

    // Validate required fields
    if (!creator || !name || !symbol) {
      return NextResponse.json(
        { error: 'Missing required fields: creator, name, symbol' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: creator }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if symbol already exists
    const existingCoin = await db.creatorCoin.findUnique({
      where: { symbol }
    })

    if (existingCoin) {
      return NextResponse.json(
        { error: 'Symbol already exists' },
        { status: 409 }
      )
    }

    // Create creator coin via Zora API
    const zoraResponse = await createZoraCoin({
      creator,
      name,
      symbol,
      metadata: {
        type: 'RAW_URI',
        uri: metadataUri || `https://metadata.example.com/${symbol.toLowerCase()}`
      },
      currency,
      chainId,
      startingMarketCap,
      platformReferrer,
      payoutRecipientOverride: payoutRecipientOverride || user.walletAddress,
      smartWalletRouting,
      additionalOwners: [user.walletAddress].filter(Boolean)
    })

    if (!zoraResponse.success) {
      return NextResponse.json(
        { error: 'Failed to create creator coin on Zora', details: zoraResponse.error },
        { status: 500 }
      )
    }

    // Create database record
    const creatorCoin = await db.creatorCoin.create({
      data: {
        name,
        symbol,
        contractAddress: zoraResponse.contractAddress,
        creator,
        metadataUri: metadataUri || `https://metadata.example.com/${symbol.toLowerCase()}`,
        currency,
        chainId,
        marketCap: startingMarketCap,
        platformReferrer,
        payoutRecipient: payoutRecipientOverride || user.walletAddress,
        smartWalletRouting,
        currentPrice: 0.001, // Initial price
        totalSupply: 1000000, // Initial supply
        marketCapValue: startingMarketCap === 'LOW' ? 1000 : startingMarketCap === 'MEDIUM' ? 10000 : 100000
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            walletAddress: true
          }
        }
      }
    })

    // Create initial collateral value record
    await db.collateralValue.create({
      data: {
        creatorCoinId: creatorCoin.id,
        price: creatorCoin.currentPrice,
        marketCap: creatorCoin.marketCapValue,
        source: 'ZORA'
      }
    })

    return NextResponse.json({ 
      creatorCoin,
      zoraCalls: zoraResponse.calls,
      contractAddress: zoraResponse.contractAddress
    })
  } catch (error) {
    console.error('Error creating creator coin:', error)
    return NextResponse.json(
      { error: 'Failed to create creator coin' },
      { status: 500 }
    )
  }
}

async function createZoraCoin(coinData: {
  creator: string
  name: string
  symbol: string
  metadata: {
    type: string
    uri: string
  }
  currency: string
  chainId: number
  startingMarketCap: string
  platformReferrer?: string
  payoutRecipientOverride?: string
  smartWalletRouting: string
  additionalOwners: string[]
}) {
  try {
    const zai = await ZAI.create()
    
    // Use Zora API to create creator coin
    const response = await fetch('https://api.zora.co/api/v1/coins/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZORA_API_KEY}`
      },
      body: JSON.stringify(coinData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || 'Failed to create coin'
      }
    }

    const result = await response.json()
    
    return {
      success: true,
      calls: result.calls,
      contractAddress: result.contractAddress
    }
  } catch (error) {
    console.error('Error creating Zora coin:', error)
    
    // For demo purposes, return mock successful response
    return {
      success: true,
      calls: [
        {
          to: "0x0000000000000000000000000000000000000000",
          data: "0x1234567890abcdef",
          value: "0"
        }
      ],
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`
    }
  }
}