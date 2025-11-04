import { NextRequest, NextResponse } from "next/server";
import {
  validateUserCoinOwnership,
  calculateLoanEligibility,
} from "@/lib/services/zoraApi";

/**
 * Validate creator coin using Zora API
 * This endpoint checks if the user owns the specified creator coin
 */
export async function POST(request: NextRequest) {
  try {
    const { coinAddress, userAddress, chainId } = await request.json();

    if (!coinAddress || !userAddress) {
      return NextResponse.json(
        { error: "Missing required fields: coinAddress and userAddress" },
        { status: 400 }
      );
    }

    // Use Base mainnet by default, or Base Sepolia for testnet
    const network = chainId || 8453; // 8453 = Base mainnet, 84532 = Base Sepolia

    // Validate user owns the creator coin
    const validation = await validateUserCoinOwnership(
      coinAddress,
      userAddress,
      network
    );

    if (!validation.isValid) {
      return NextResponse.json({
        isValid: false,
        balance: validation.balanceDecimal,
        balanceRaw: validation.balance,
        message: "You do not own this creator coin or have insufficient balance",
        coinData: validation.coinData,
      });
    }

    // Calculate loan eligibility based on coin data
    let eligibility: ReturnType<typeof calculateLoanEligibility> | null = null;
    if (validation.coinData) {
      eligibility = calculateLoanEligibility(validation.coinData);
    }

    return NextResponse.json({
      isValid: true,
      balance: validation.balanceDecimal,
      balanceRaw: validation.balance,
      message: `Creator coin validated successfully. You own ${validation.balanceDecimal.toFixed(4)} tokens.`,
      coinData: validation.coinData
        ? {
            name: validation.coinData.name,
            symbol: validation.coinData.symbol,
            address: validation.coinData.address,
            marketCap: validation.coinData.marketCap,
            priceInUsdc: validation.coinData.tokenPrice.priceInUsdc,
            uniqueHolders: validation.coinData.uniqueHolders,
            totalSupply: validation.coinData.totalSupply,
          }
        : null,
      loanEligibility: eligibility,
    });
  } catch (error) {
    console.error("Error validating creator coin:", error);
    return NextResponse.json(
      {
        error: "Failed to validate creator coin",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
