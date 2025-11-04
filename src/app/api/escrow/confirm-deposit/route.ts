import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { loanId, txHash, amount } = await request.json();

    if (!loanId || !txHash || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Update database with deposit confirmation
    // This would typically update the loan application status to "COLLATERAL_DEPOSITED"
    // and store the transaction hash for verification

    console.log(`Deposit confirmed for loan ${loanId}: ${txHash}`);

    return NextResponse.json({
      success: true,
      loanId,
      txHash,
      amount,
      message: "Collateral deposit confirmed",
    });
  } catch (error) {
    console.error("Error confirming deposit:", error);
    return NextResponse.json(
      {
        error: "Failed to confirm deposit",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
