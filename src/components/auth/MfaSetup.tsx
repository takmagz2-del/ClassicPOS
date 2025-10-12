"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import QRCode from "react-qr-code"; // We'll need to install this for QR code generation

interface MfaSetupProps {
  onSetupComplete: () => void;
}

const MfaSetup = ({ onSetupComplete }: MfaSetupProps) => {
  const { user, generateMfaSecret, verifyMfaSetup } = useAuth();
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const setupNewSecret = async () => {
      if (user?.email) {
        const { secret: newSecret, qrCodeUrl: newQrCodeUrl } = await generateMfaSecret(user.email);
        setSecret(newSecret);
        setQrCodeUrl(newQrCodeUrl);
      }
    };
    setupNewSecret();
  }, [user?.email, generateMfaSecret]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret || !totpCode) {
      toast.error("Please enter the TOTP code.");
      return;
    }

    setIsLoading(true);
    const success = await verifyMfaSetup(secret, totpCode);
    setIsLoading(false);

    if (success) {
      toast.success("MFA enabled successfully!");
      onSetupComplete();
    } else {
      toast.error("Invalid TOTP code. Please try again.");
    }
  };

  if (!secret || !qrCodeUrl) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loading MFA Setup...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Generating your secret and QR code...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Enable Two-Factor Authentication</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy) and enter the code to verify.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <QRCode value={qrCodeUrl} size={200} level="H" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          If you can't scan, manually enter this secret key: <span className="font-mono font-semibold text-foreground break-all">{secret}</span>
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <Label htmlFor="totp-code">Verification Code</Label>
            <Input
              id="totp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify and Enable MFA"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MfaSetup;