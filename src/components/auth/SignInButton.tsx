"use client";

import { AuthButton } from "@coinbase/cdp-react";
import { useIsSignedIn, useEvmAddress } from "@coinbase/cdp-hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Wallet } from "lucide-react";

export function SignInButton() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();

  if (isSignedIn && evmAddress) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Signed In</p>
                <p className="text-xs text-green-700 font-mono">
                  {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white">
              <Wallet className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Sign In to Continue</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in with email, SMS, or social accounts to access your embedded wallet
            </p>
          </div>
          <AuthButton />
        </div>
      </CardContent>
    </Card>
  );
}
