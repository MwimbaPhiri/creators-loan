"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { SendEvmTransactionButton } from "@coinbase/cdp-react";

interface DepositCollateralProps {
  loanId: string;
  requiredCollateralAmount: number;
  creatorCoinAddress: string;
  escrowAddress: string;
  onDepositSuccess?: () => void;
}

export function DepositCollateral({
  loanId,
  requiredCollateralAmount,
  creatorCoinAddress,
  escrowAddress,
  onDepositSuccess,
}: DepositCollateralProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const { toast } = useToast();
  const { evmAddress } = useEvmAddress();

  const validateCreatorCoin = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Call Zora API to validate the creator coin
      const response = await fetch("/api/zora/validate-coin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinAddress: creatorCoinAddress,
          userAddress: evmAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Validation failed");
      }

      setValidationResult({
        isValid: data.isValid,
        message: data.isValid
          ? `✓ Valid creator coin! You own ${data.balance} tokens.`
          : `✗ Invalid or insufficient balance. Required: ${requiredCollateralAmount} tokens.`,
      });

      if (!data.isValid) {
        toast({
          title: "Validation Failed",
          description: data.message || "Creator coin validation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationResult({
        isValid: false,
        message: error instanceof Error ? error.message : "Validation failed",
      });

      toast({
        title: "Validation Error",
        description: "Failed to validate creator coin",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDepositSuccess = async (txHash: string) => {
    console.log("Deposit transaction successful:", txHash);

    toast({
      title: "Collateral Deposited",
      description: "Your creator coins have been deposited into escrow",
    });

    // Update loan application status
    try {
      await fetch("/api/escrow/confirm-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId,
          txHash,
          amount: depositAmount,
        }),
      });

      onDepositSuccess?.();
    } catch (error) {
      console.error("Error confirming deposit:", error);
    }
  };

  const network = process.env.NEXT_PUBLIC_NETWORK || "base-mainnet";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Deposit Collateral
        </CardTitle>
        <CardDescription>
          Deposit your creator coins into escrow to secure your loan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Creator Coin Address</Label>
          <Input value={creatorCoinAddress} disabled />
        </div>

        <div className="space-y-2">
          <Label>Required Collateral Amount</Label>
          <Input value={`${requiredCollateralAmount} tokens`} disabled />
        </div>

        <div className="space-y-2">
          <Label>Escrow Address</Label>
          <Input value={escrowAddress} disabled className="font-mono text-sm" />
        </div>

        <Button
          onClick={validateCreatorCoin}
          disabled={isValidating || !evmAddress}
          className="w-full"
          variant="outline"
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            "Validate Creator Coin"
          )}
        </Button>

        {validationResult && (
          <Alert variant={validationResult.isValid ? "default" : "destructive"}>
            {validationResult.isValid ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{validationResult.message}</AlertDescription>
          </Alert>
        )}

        {validationResult?.isValid && evmAddress && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Deposit Amount</Label>
              <Input
                id="depositAmount"
                type="number"
                placeholder={`Enter amount (min: ${requiredCollateralAmount})`}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min={requiredCollateralAmount}
              />
            </div>

            <SendEvmTransactionButton
              account={evmAddress}
              network={network}
              transaction={{
                to: escrowAddress,
                value: BigInt(depositAmount || "0"),
                chainId: network === "base-mainnet" ? 8453 : 84532,
                type: "eip1559",
              }}
              onSuccess={handleDepositSuccess}
              onError={(error) => {
                console.error("Deposit failed:", error);
                toast({
                  title: "Deposit Failed",
                  description: error.message,
                  variant: "destructive",
                });
              }}
              pendingLabel="Depositing..."
            >
              Deposit Collateral
            </SendEvmTransactionButton>
          </div>
        )}

        {!evmAddress && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in with your wallet to deposit collateral
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
