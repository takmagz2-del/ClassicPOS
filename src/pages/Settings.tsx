"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import MfaSetup from "@/components/auth/MfaSetup";
import ReceiptSettingsForm from "@/components/settings/ReceiptSettingsForm";
import PrinterSettingsForm from "@/components/settings/PrinterSettingsForm";
import { toast } from "sonner";

const Settings = () => {
  const { user, disableMfa } = useAuth();
  const [showMfaSetup, setShowMfaSetup] = React.useState(false);

  const handleMfaSetupComplete = () => {
    setShowMfaSetup(false);
    // Optionally refresh user state or show a success message
  };

  const handleDisableMfa = async () => {
    if (window.confirm("Are you sure you want to disable MFA?")) {
      const success = await disableMfa();
      if (success) {
        toast.success("MFA has been disabled.");
      } else {
        toast.error("Failed to disable MFA.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>MFA Status:</strong> {user?.mfaEnabled ? "Enabled" : "Disabled"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (MFA)</CardTitle>
        </CardHeader>
        <CardContent>
          {user?.mfaEnabled ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">MFA is currently enabled for your account.</p>
              <Button variant="destructive" onClick={handleDisableMfa}>
                Disable MFA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">MFA is currently disabled. Enable it for enhanced security.</p>
              {!showMfaSetup ? (
                <Button onClick={() => setShowMfaSetup(true)}>
                  Enable MFA
                </Button>
              ) : (
                <MfaSetup onSetupComplete={handleMfaSetupComplete} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <ReceiptSettingsForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Printer Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <PrinterSettingsForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;