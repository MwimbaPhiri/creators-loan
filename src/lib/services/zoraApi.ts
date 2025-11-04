/**
 * Zora API Service
 * Real implementation using Zora SDK API
 */

const ZORA_API_BASE_URL = "https://api-sdk.zora.engineering";
const ZORA_API_KEY = process.env.ZORA_API_KEY || "zora_api_3fb46c865918d9a78c175ff29c90895c8b4367c1c56e6b873c940be87c7fb4f3";

interface ZoraTokenBalance {
  balance: string;
  ownerAddress: string;
  ownerProfile?: {
    id: string;
    handle: string;
    platformBlocked: boolean;
  };
}

interface ZoraCoinData {
  zora20Token: {
    id: string;
    name: string;
    description: string;
    address: string;
    symbol: string;
    totalSupply: string;
    marketCap: string;
    tokenPrice: {
      priceInUsdc: string;
      currencyAddress: string;
      priceInPoolToken: string;
    };
    uniqueHolders: number;
    creatorAddress: string;
    chainId: number;
    creatorProfile?: {
      id: string;
      handle: string;
      platformBlocked: boolean;
      avatar?: {
        previewImage?: {
          blurhash: string;
          medium: string;
          small: string;
        };
      };
      socialAccounts?: any;
      creatorCoin?: {
        address: string;
      };
    };
    mediaContent?: {
      mimeType: string;
      originalUri: string;
      previewImage?: {
        small: string;
        medium: string;
        blurhash: string;
      };
      videoPreviewUrl?: string;
      videoHlsUrl?: string;
    };
  };
}

interface ZoraCoinHoldersData {
  zora20Token: {
    tokenBalances: {
      pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
      };
      count: number;
      edges: Array<{
        node: ZoraTokenBalance;
      }>;
    };
  };
}

/**
 * Get creator coin information from Zora
 */
export async function getCreatorCoin(
  coinAddress: string,
  chainId: number = 8453 // Base mainnet
): Promise<ZoraCoinData> {
  try {
    const url = new URL(`${ZORA_API_BASE_URL}/coin`);
    url.searchParams.append("address", coinAddress);
    url.searchParams.append("chain", chainId.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ZORA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zora API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching creator coin from Zora:", error);
    throw error;
  }
}

/**
 * Get token holders for a creator coin
 */
export async function getCoinHolders(
  coinAddress: string,
  chainId: number = 8453,
  count: number = 25,
  after?: string
): Promise<ZoraCoinHoldersData> {
  try {
    const url = new URL(`${ZORA_API_BASE_URL}/coinHolders`);
    url.searchParams.append("address", coinAddress);
    url.searchParams.append("chainId", chainId.toString());
    url.searchParams.append("count", count.toString());
    if (after) {
      url.searchParams.append("after", after);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ZORA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zora API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching coin holders from Zora:", error);
    throw error;
  }
}

/**
 * Check if a user owns a specific creator coin and get their balance
 */
export async function validateUserCoinOwnership(
  coinAddress: string,
  userAddress: string,
  chainId: number = 8453
): Promise<{
  isValid: boolean;
  balance: string;
  balanceDecimal: number;
  coinData?: ZoraCoinData["zora20Token"];
}> {
  try {
    // First, get the coin data to ensure it exists
    const coinData = await getCreatorCoin(coinAddress, chainId);

    if (!coinData.zora20Token) {
      return {
        isValid: false,
        balance: "0",
        balanceDecimal: 0,
      };
    }

    // Get holders to find the user's balance
    const holdersData = await getCoinHolders(coinAddress, chainId, 100);

    // Find the user in the holders list
    const userBalance = holdersData.zora20Token.tokenBalances.edges.find(
      (edge) => edge.node.ownerAddress.toLowerCase() === userAddress.toLowerCase()
    );

    if (!userBalance) {
      return {
        isValid: false,
        balance: "0",
        balanceDecimal: 0,
        coinData: coinData.zora20Token,
      };
    }

    // Convert balance to decimal (assuming 18 decimals for Zora tokens)
    const balanceDecimal = parseFloat(userBalance.node.balance) / 1e18;

    return {
      isValid: balanceDecimal > 0,
      balance: userBalance.node.balance,
      balanceDecimal,
      coinData: coinData.zora20Token,
    };
  } catch (error) {
    console.error("Error validating coin ownership:", error);
    throw error;
  }
}

/**
 * Get multiple coins data at once
 */
export async function getMultipleCoins(
  coins: Array<{ address: string; chainId: number }>
): Promise<any> {
  try {
    const url = new URL(`${ZORA_API_BASE_URL}/coins`);
    url.searchParams.append("coins", JSON.stringify(coins));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ZORA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zora API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching multiple coins from Zora:", error);
    throw error;
  }
}

/**
 * Get creator profile and their coins
 */
export async function getCreatorProfile(
  identifier: string, // handle or address
  chainIds: number[] = [8453]
): Promise<any> {
  try {
    const url = new URL(`${ZORA_API_BASE_URL}/profile`);
    url.searchParams.append("identifier", identifier);
    chainIds.forEach((id) => url.searchParams.append("chainIds", id.toString()));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ZORA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zora API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching creator profile from Zora:", error);
    throw error;
  }
}

/**
 * Calculate loan eligibility based on coin data
 */
export function calculateLoanEligibility(coinData: ZoraCoinData["zora20Token"]) {
  const marketCapUSD = parseFloat(coinData.marketCap);
  const priceInUSDC = parseFloat(coinData.tokenPrice.priceInUsdc);
  const uniqueHolders = coinData.uniqueHolders;

  // Eligibility criteria
  const minMarketCap = 10000; // $10,000 minimum market cap
  const minHolders = 10; // At least 10 unique holders
  const minPrice = 0.01; // At least $0.01 per token

  const isEligible =
    marketCapUSD >= minMarketCap &&
    uniqueHolders >= minHolders &&
    priceInUSDC >= minPrice;

  // Calculate max loan amount (50% of market cap, capped at $100k)
  const maxLoanAmount = Math.min(marketCapUSD * 0.5, 100000);

  // Calculate required collateral (200% of loan amount)
  const collateralRatio = 2.0;

  return {
    isEligible,
    marketCapUSD,
    priceInUSDC,
    uniqueHolders,
    maxLoanAmount,
    collateralRatio,
    minCollateralValue: maxLoanAmount * collateralRatio,
  };
}
