import { NextRequest, NextResponse } from "next/server";
import { sendFromEscrow } from "@/lib/services/serverWallet";

/**
 * Process loan repayment and release collateral
 */
export async function POST(request: NextRequest) {
  try {
    const { loanId, paymentId, amount, borrowerAddress } = await request.json();

    if (!loanId || !paymentId || !amount || !borrowerAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Verify payment was successful via Base Pay
    // TODO: Check loan status and remaining balance from database

    const network = process.env.NEXT_PUBLIC_NETWORK || "base-mainnet";

    // Calculate collateral to release (proportional to payment)
    // This is a simplified example - implement your actual logic
    const collateralToRelease = BigInt(Math.floor(parseFloat(amount) * 1e18));

    // Get escrow account address for this loan
    // TODO: Retrieve from database
    const escrowAddress = "0x..."; // Replace with actual escrow address

    // Release collateral back to borrower
    const releaseResult = await sendFromEscrow({
      fromAddress: escrowAddress,
      toAddress: borrowerAddress,
      amount: collateralToRelease,
      network,
    });

    console.log(`Collateral released: ${releaseResult.transactionHash}`);

    return NextResponse.json({
      success: true,
      loanId,
      paymentId,
      releaseTransactionHash: releaseResult.transactionHash,
      collateralReleased: collateralToRelease.toString(),
      message: "Payment processed and collateral released",
    });
  } catch (error) {
    console.error("Error processing repayment:", error);
    return NextResponse.json(
      {
        error: "Failed to process repayment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
