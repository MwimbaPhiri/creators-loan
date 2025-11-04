interface ZoraCoinData {
  id: string
  platformBlocked: boolean
  name: string
  description: string
  address: string
  symbol: string
  totalSupply: string
  totalVolume: string
  volume24h: string
  createdAt: string
  creatorAddress: string
  poolCurrencyToken: {
    address: string
    name: string
    decimals: number
  }
  tokenPrice: {
    priceInUsdc: string
    currencyAddress: string
    priceInPoolToken: string
  }
  marketCap: string
  marketCapDelta24h: string
  chainId: number
  tokenUri: string
  platformReferrerAddress: string
  payoutRecipientAddress: string
  creatorProfile: {
    id: string
    handle: string
    platformBlocked: boolean
    avatar: {
      previewImage: {
        blurhash: string
        medium: string
        small: string
      }
    }
    socialAccounts: {
      instagram?: {
        username: string
        displayName: string
        id: string
      }
      tiktok?: {
        username: string
        displayName: string
        id: string
      }
      twitter?: {
        username: string
        displayName: string
        id: string
      }
      farcaster?: {
        username: string
        displayName: string
        id: string
      }
    }
    creatorCoin: {
      address: string
    }
  }
  uniqueHolders: number
  uniswapV4PoolKey: {
    token0Address: string
    token1Address: string
    fee: number
    tickSpacing: number
    hookAddress: string
  }
  uniswapV3PoolAddress: string
}

interface ZoraProfileData {
  id: string
  handle: string
  platformBlocked: boolean
  avatar: {
    previewImage: {
      blurhash: string
      medium: string
      small: string
    }
  }
  socialAccounts: {
    instagram?: {
      username: string
      displayName: string
      id: string
    }
    tiktok?: {
      username: string
      displayName: string
      id: string
    }
    twitter?: {
      username: string
      displayName: string
      id: string
    }
    farcaster?: {
      username: string
      displayName: string
      id: string
    }
  }
  creatorCoin: {
    address: string
  }
  createdCoins: {
    count: number
    edges: Array<{
      node: ZoraCoinData
    }>
  }
}

export class ZoraAPI {
  private static BASE_URL = 'https://api-sdk.zora.engineering'
  private static API_KEY = process.env.ZORA_API_KEY

  static async getCoinData(address: string, chainId: number = 8453): Promise<ZoraCoinData | null> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/coin?address=${address}&chain=${chainId}`,
        {
          headers: {
            'api-key': this.API_KEY || '',
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        console.error('Zora API error:', response.status, response.statusText)
        return null
      }

      const data = await response.json()
      return data.zora20Token || null
    } catch (error) {
      console.error('Error fetching Zora coin data:', error)
      return null
    }
  }

  static async getProfileData(identifier: string): Promise<ZoraProfileData | null> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/profile?identifier=${identifier}`,
        {
          headers: {
            'api-key': this.API_KEY || '',
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        console.error('Zora API error:', response.status, response.statusText)
        return null
      }

      const data = await response.json()
      return data.profile || null
    } catch (error) {
      console.error('Error fetching Zora profile data:', error)
      return null
    }
  }

  static async getProfileCoins(identifier: string, count: number = 30): Promise<ZoraCoinData[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/profileCoins?identifier=${identifier}&count=${count}&chainIds=${8453}`,
        {
          headers: {
            'api-key': this.API_KEY || '',
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        console.error('Zora API error:', response.status, response.statusText)
        return []
      }

      const data = await response.json()
      return data.profile?.createdCoins?.edges?.map((edge: any) => edge.node) || []
    } catch (error) {
      console.error('Error fetching profile coins:', error)
      return []
    }
  }

  static async validateCreatorCoin(address: string): Promise<{
    isValid: boolean
    marketCap: number
    currentPrice: number
    totalSupply: number
    eligibleForLoan: boolean
    maxLoanAmount: number
    requiredCollateral: number
    coinData: ZoraCoinData | null
  }> {
    try {
      const coinData = await this.getCoinData(address)
      
      if (!coinData) {
        return {
          isValid: false,
          marketCap: 0,
          currentPrice: 0,
          totalSupply: 0,
          eligibleForLoan: false,
          maxLoanAmount: 0,
          requiredCollateral: 0,
          coinData: null
        }
      }

      // Parse numeric values from string responses
      const marketCap = parseFloat(coinData.marketCap || '0')
      const currentPrice = parseFloat(coinData.tokenPrice?.priceInUsdc || '0')
      const totalSupply = parseFloat(coinData.totalSupply || '0')

      // Check eligibility criteria
      const minMarketCap = 10000 // $10,000 minimum market cap
      const eligibleForLoan = marketCap >= minMarketCap && !coinData.platformBlocked

      // Calculate loan terms: 10% loan value for 20% collateral
      const maxLoanAmount = marketCap * 0.10 // 10% of market cap
      const requiredCollateral = marketCap * 0.20 // 20% of market cap

      return {
        isValid: true,
        marketCap,
        currentPrice,
        totalSupply,
        eligibleForLoan,
        maxLoanAmount,
        requiredCollateral,
        coinData
      }
    } catch (error) {
      console.error('Error validating creator coin:', error)
      return {
        isValid: false,
        marketCap: 0,
        currentPrice: 0,
        totalSupply: 0,
        eligibleForLoan: false,
        maxLoanAmount: 0,
        requiredCollateral: 0,
        coinData: null
      }
    }
  }

  static async getUserCoinHoldings(address: string): Promise<{
    coinAddress: string
    coinData: ZoraCoinData
    balance: string
    valueUSD: number
    eligibleForLoan: boolean
    maxLoanAmount: number
  }[]> {
    try {
      const profileCoins = await this.getProfileCoins(address)
      
      const holdings = await Promise.all(
        profileCoins.map(async (coin) => {
          const validation = await this.validateCreatorCoin(coin.address)
          
          return {
            coinAddress: coin.address,
            coinData: coin,
            balance: '0', // Would need to call /profileBalances to get actual balance
            valueUSD: validation.marketCap,
            eligibleForLoan: validation.eligibleForLoan,
            maxLoanAmount: validation.maxLoanAmount
          }
        })
      )

      return holdings.filter(h => h.eligibleForLoan)
    } catch (error) {
      console.error('Error fetching user coin holdings:', error)
      return []
    }
  }

  static async getCoinHolders(address: string, chainId: number = 8453, count: number = 25): Promise<{
    ownerAddress: string
    balance: string
    ownerProfile: {
      id: string
      handle: string
      platformBlocked: boolean
      avatar: {
        previewImage: {
          blurhash: string
          medium: string
          small: string
        }
      }
    }
  }[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/coinHolders?chainId=${chainId}&address=${address}&count=${count}`,
        {
          headers: {
            'api-key': this.API_KEY || '',
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        console.error('Zora API error:', response.status, response.statusText)
        return []
      }

      const data = await response.json()
      return data.zora20Token?.tokenBalances?.edges?.map((edge: any) => edge.node) || []
    } catch (error) {
      console.error('Error fetching coin holders:', error)
      return []
    }
  }

  static transformCoinData(data: ZoraCoinData): {
    address: string
    name: string
    symbol: string
    description: string
    image?: string
    marketCap: number
    currentPrice: number
    totalSupply: number
    volume24h: number
    change24h: number
    creator: string
    createdAt: string
    chainId: number
    uniqueHolders: number
  } {
    return {
      address: data.address,
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      image: data.creatorProfile?.avatar?.previewImage?.medium,
      marketCap: parseFloat(data.marketCap || '0'),
      currentPrice: parseFloat(data.tokenPrice?.priceInUsdc || '0'),
      totalSupply: parseFloat(data.totalSupply || '0'),
      volume24h: parseFloat(data.volume24h || '0'),
      change24h: parseFloat(data.marketCapDelta24h || '0'),
      creator: data.creatorAddress,
      createdAt: data.createdAt,
      chainId: data.chainId,
      uniqueHolders: data.uniqueHolders
    }
  }
}

// Mock data for development when API is not available
export const mockZoraData = {
  coins: [
    {
      id: "0x1234567890123456789012345678901234567890",
      platformBlocked: false,
      name: "Creator Token",
      description: "A creator token for content creators",
      address: "0x1234567890123456789012345678901234567890",
      symbol: "CREATOR",
      totalSupply: "1000000000000000000000000",
      totalVolume: "50000000000000000000000",
      volume24h: "5000000000000000000000",
      createdAt: "2024-01-01T00:00:00Z",
      creatorAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45",
      poolCurrencyToken: {
        address: "0xA0b86a33E6441e7e8f5A2321e6a8b8C7e8e8e8e8e8e8",
        name: "USDC",
        decimals: 6
      },
      tokenPrice: {
        priceInUsdc: "0.05",
        currencyAddress: "0xA0b86a33E6441e7e8f5A2321e6a8b8C7e8e8e8e8e8e8e8",
        priceInPoolToken: "0.05"
      },
      marketCap: "50000",
      marketCapDelta24h: "5.2",
      chainId: 8453,
      tokenUri: "https://metadata.example.com/creator",
      platformReferrerAddress: "0x0000000000000000000000000000000000000000",
      payoutRecipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45",
      creatorProfile: {
        id: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45",
        handle: "creator",
        platformBlocked: false,
        avatar: {
          previewImage: {
            blurhash: "LGF5?x%4M{t6xu%4t6xu%4t6xu%4t6xu",
            medium: "https://example.com/avatar.jpg",
            small: "https://example.com/avatar-small.jpg"
          }
        }
      },
      socialAccounts: {
        twitter: {
          username: "creator",
          displayName: "Creator",
          id: "123456789"
        }
      },
      creatorCoin: {
        address: "0x1234567890123456789012345678901234567890"
      },
      uniqueHolders: 1000,
      uniswapV4PoolKey: {
        token0Address: "0x1234567890123456789012345678901234567890",
        token1Address: "0xA0b86a33E6441e7e8f5A2321e6a8b8C7e8e8e8e8e8e8e8",
        fee: 3000,
        tickSpacing: 60,
        hookAddress: "0x0000000000000000000000000000000000000000"
      },
      uniswapV3PoolAddress: "0x0987654321098765432109876543210987654321"
    }
  ]
}