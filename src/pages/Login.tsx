"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [totpCode, setTotpCode] = useState<string>("");
  const [backupCode, setBackupCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);
  const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMfaRequired(false); // Reset MFA requirement on new submission

    const success = await login(email, password, useBackupCode ? undefined : totpCode, useBackupCode ? backupCode : undefined);
    setIsLoading(false);

    if (!success) {
      // If login failed and MFA was not yet attempted, check if it's an MFA requirement
      const mockUser = (useAuth() as any).mockUsers[email]; // Access mockUsers for demo
      if (mockUser?.mfaEnabled && !totpCode && !backupCode) {
        setMfaRequired(true);
        toast.info("MFA required. Please enter your TOTP code or a backup code.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">ClassicPOS</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {mfaRequired && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mfa-code">
                    {useBackupCode ? "Backup Code" : "Authenticator Code"}
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setUseBackupCode(!useBackupCode)}
                    className="p-0 h-auto"
                    disabled={isLoading}
                  >
                    {useBackupCode ? "Use Authenticator App" : "Use Backup Code"}
                  </Button>
                </div>
                {useBackupCode ? (
                  <Input
                    id="mfa-code"
                    type="text"
                    placeholder="Enter backup code"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                ) : (
                  <Input
                    id="mfa-code"
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
                )}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Login;