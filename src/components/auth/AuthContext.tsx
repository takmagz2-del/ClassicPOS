"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TOTP, Secret } from "otpauth"; // Corrected import: using named exports

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; mfaEnabled: boolean; mfaSecret?: string; backupCodes?: string[] } | null;
  login: (email: string, password: string, totpCode?: string, backupCode?: string) => Promise<boolean>;
  logout: () => void;
  generateMfaSecret: (email: string) => Promise<{ secret: string; qrCodeUrl: string }>;
  verifyMfaSetup: (secret: string, totpCode: string) => Promise<boolean>;
  generateBackupCodes: (email: string) => Promise<string[]>;
  saveBackupCodes: (email: string, codes: string[]) => void;
  disableMfa: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string; mfaEnabled: boolean; mfaSecret?: string; backupCodes?: string[] } | null>(null);
  const navigate = useNavigate();

  // Mock user data for demonstration, in a real app this would come from a backend
  const [mockUsers, setMockUsers] = useState<{ [key: string]: { password: string; mfaEnabled: boolean; mfaSecret?: string; backupCodes?: string[]; tempMfaSecret?: string } }>({
    "admin@example.com": { password: "password", mfaEnabled: false },
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUserEmail = localStorage.getItem("userEmail");
    if (token && storedUserEmail && mockUsers[storedUserEmail]) {
      setIsAuthenticated(true);
      setUser({
        email: storedUserEmail,
        mfaEnabled: mockUsers[storedUserEmail].mfaEnabled,
        mfaSecret: mockUsers[storedUserEmail].mfaSecret,
        backupCodes: mockUsers[storedUserEmail].backupCodes,
      });
    }
  }, [mockUsers]); // Depend on mockUsers to re-evaluate if user data changes

  const login = async (email: string, password: string, totpCode?: string, backupCode?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = mockUsers[email];
        if (!userData || userData.password !== password) {
          toast.error("Invalid credentials.");
          resolve(false);
          return;
        }

        if (userData.mfaEnabled) {
          if (totpCode) {
            // Verify TOTP code
            const otp = new TOTP({ secret: userData.mfaSecret }); // Updated usage
            const isValid = otp.validate({ token: totpCode });

            if (isValid === null) {
              toast.error("Invalid TOTP code.");
              resolve(false);
              return;
            }
          } else if (backupCode) {
            // Verify backup code
            const codeIndex = userData.backupCodes?.indexOf(backupCode);
            if (codeIndex !== undefined && codeIndex > -1) {
              // Remove used backup code
              const updatedBackupCodes = userData.backupCodes?.filter((_, index) => index !== codeIndex);
              setMockUsers((prev) => ({
                ...prev,
                [email]: {
                  ...prev[email],
                  backupCodes: updatedBackupCodes,
                },
              }));
              toast.success("Backup code used successfully.");
            } else {
              toast.error("Invalid or used backup code.");
              resolve(false);
              return;
            }
          } else {
            toast.info("MFA required. Please enter your TOTP code or a backup code.");
            resolve(false); // Indicate that MFA is required
            return;
          }
        }

        setIsAuthenticated(true);
        setUser({
          email,
          mfaEnabled: userData.mfaEnabled,
          mfaSecret: userData.mfaSecret,
          backupCodes: userData.backupCodes,
        });
        localStorage.setItem("authToken", "mock-jwt-token");
        localStorage.setItem("userEmail", email);
        toast.success("Login successful!");
        navigate("/");
        resolve(true);
      }, 1000);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  const generateMfaSecret = useCallback(async (email: string) => {
    const otp = new TOTP({ // Updated usage
      issuer: "ClassicPOS",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: Secret.randomKey(), // Updated usage
    });

    const secret = otp.secret.base32;
    const qrCodeUrl = otp.toString();

    setMockUsers((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        tempMfaSecret: secret,
      },
    }));

    return { secret, qrCodeUrl };
  }, []);

  const verifyMfaSetup = async (secret: string, totpCode: string): Promise<boolean> => {
    if (!user?.email) return false;

    const otp = new TOTP({ secret }); // Updated usage
    const isValid = otp.validate({ token: totpCode });

    if (isValid !== null) {
      setMockUsers((prev) => ({
        ...prev,
        [user.email]: {
          ...prev[user.email],
          mfaEnabled: true,
          mfaSecret: secret,
          tempMfaSecret: undefined,
        },
      }));
      setUser((prev) => prev ? { ...prev, mfaEnabled: true, mfaSecret: secret } : null);
      return true;
    }
    return false;
  };

  const generateBackupCodes = useCallback(async (email: string): Promise<string[]> => {
    // In a real app, these would be generated securely on the backend
    // and hashed before storage.
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomUUID().substring(0, 8).toUpperCase());
    }
    // Temporarily store them until the user confirms saving
    setMockUsers((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        tempBackupCodes: codes,
      },
    }));
    return codes;
  }, []);

  const saveBackupCodes = useCallback((email: string, codes: string[]) => {
    setMockUsers((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        backupCodes: codes,
        tempBackupCodes: undefined, // Clear temporary codes
      },
    }));
    setUser((prev) => prev ? { ...prev, backupCodes: codes } : null);
  }, []);

  const disableMfa = async (): Promise<boolean> => {
    if (!user?.email) {
      toast.error("No user logged in.");
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    setMockUsers((prev) => ({
      ...prev,
      [user.email]: {
        ...prev[user.email],
        mfaEnabled: false,
        mfaSecret: undefined,
        backupCodes: undefined, // Clear backup codes when MFA is disabled
      },
    }));
    setUser((prev) => prev ? { ...prev, mfaEnabled: false, mfaSecret: undefined, backupCodes: undefined } : null);
    toast.success("MFA disabled successfully.");
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, generateMfaSecret, verifyMfaSetup, generateBackupCodes, saveBackupCodes, disableMfa }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};