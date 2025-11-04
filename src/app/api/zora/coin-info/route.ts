import { NextRequest, NextResponse } from "next/server";
import { getCreatorCoin } from "@/lib/services/zoraApi";

/**
 * Get detailed information about a creator coin
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coinAddress = searchParams.get("address");
    const chainId = searchParams.get("chainId");

    if (!coinAddress) {
      return NextResponse.json(
        { error: "Missing required parameter: address" },
        { status: 400 }
      );
    }

    const network = chainId ? parseInt(chainId) : 8453;

    const coinData = await getCreatorCoin(coinAddress, network);

    if (!coinData.zora20Token) {
      return NextResponse.json(
        { error: "Creator coin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coin: {
        id: coinData.zora20Token.id,
        name: coinData.zora20Token.name,
        description: coinData.zora20Token.description,
        address: coinData.zora20Token.address,
        symbol: coinData.zora20Token.symbol,
        totalSupply: coinData.zora20Token.totalSupply,
        marketCap: coinData.zora20Token.marketCap,
        priceInUsdc: coinData.zora20Token.tokenPrice.priceInUsdc,
        uniqueHolders: coinData.zora20Token.uniqueHolders,
        creatorAddress: coinData.zora20Token.creatorAddress,
        chainId: coinData.zora20Token.chainId,
        creatorProfile: coinData.zora20Token.creatorProfile,
        mediaContent: coinData.zora20Token.mediaContent,
      },
    });
  } catch (error) {
    console.error("Error fetching coin info:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch coin information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
