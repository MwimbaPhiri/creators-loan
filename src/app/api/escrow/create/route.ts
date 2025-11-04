import { NextRequest, NextResponse } from "next/server";
import { createLoanEscrowAccount } from "@/lib/services/serverWallet";

export async function POST(request: NextRequest) {
  try {
    const { loanId } = await request.json();

    if (!loanId) {
      return NextResponse.json(
        { error: "Loan ID is required" },
        { status: 400 }
      );
    }

    // Create escrow account for this loan
    const escrowAccount = await createLoanEscrowAccount(loanId);

    return NextResponse.json({
      success: true,
      escrowAddress: escrowAccount.address,
      loanId,
    });
  } catch (error) {
    console.error("Error creating escrow account:", error);
    return NextResponse.json(
      {
        error: "Failed to create escrow account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
