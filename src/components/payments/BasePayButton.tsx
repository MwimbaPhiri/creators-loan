"use client";

import { useState } from "react";
import { pay, getPaymentStatus } from "@base-org/account";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BasePayButtonProps {
  amount: string;
  recipientAddress: string;
  loanId?: string;
  onSuccess?: (paymentId: string, txHash: string) => void;
  onError?: (error: Error) => void;
  label?: string;
  colorScheme?: "light" | "dark";
  collectUserInfo?: boolean;
}

export function BasePayButton({
  amount,
  recipientAddress,
  loanId,
  onSuccess,
  onError,
  label = "Pay with Base",
  colorScheme = "light",
  collectUserInfo = false,
}: BasePayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const testnet = process.env.NEXT_PUBLIC_TESTNET === "true";

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Initiate payment
      const payment = await pay({
        amount,
        to: recipientAddress,
        testnet,
        ...(collectUserInfo && {
          payerInfo: {
            requests: [
              { type: "email" },
              { type: "name", optional: true },
              { type: "onchainAddress" },
            ],
          },
        }),
      });

      console.log(`Payment initiated! ID: ${payment.id}`);

      toast({
        title: "Payment Initiated",
        description: "Checking payment status...",
      });

      // Poll for payment status
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const status = await getPaymentStatus({
          id: payment.id,
          testnet,
        });

        if (status.status === "completed") {
          console.log("🎉 Payment completed!");

          toast({
            title: "Payment Successful",
            description: `Transaction completed successfully!`,
          });

          // Log collected user info if available
          if (payment.payerInfoResponses) {
            console.log("Collected user info:", payment.payerInfoResponses);
          }

          // Get transaction hash from payment ID or status
          const txHash = (status as any).transactionHash || payment.id;
          onSuccess?.(payment.id, txHash);
          setIsProcessing(false);
          return;
        } else if (status.status === "failed") {
          throw new Error("Payment failed");
        }

        attempts++;
      }

      throw new Error("Payment timeout - please check transaction status");
    } catch (error) {
      console.error("Payment error:", error);

      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });

      onError?.(error instanceof Error ? error : new Error("Payment failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const isLight = colorScheme === "light";

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className={`flex items-center justify-center gap-2 ${
        isLight
          ? "bg-white text-black hover:bg-gray-100 border border-gray-300"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
      style={{ minWidth: "180px", height: "44px" }}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <img
            src={
              isLight
                ? "/images/base-account/BasePayBlueLogo.png"
                : "/images/base-account/BasePayWhiteLogo.png"
            }
            alt="Base Pay"
            className="h-5 w-auto"
            onError={(e) => {
              // Fallback if image doesn't exist
              e.currentTarget.style.display = "none";
            }}
          />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
