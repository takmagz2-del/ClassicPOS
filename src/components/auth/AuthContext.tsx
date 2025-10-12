"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OTPAuth } from "otpauth"; // Import OTPAuth

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; mfaEnabled: boolean; mfaSecret?: string } | null;
  login: (email: string, password: string, totpCode?: string) => Promise<boolean>;
  logout: () => void;
  generateMfaSecret: (email: string) => Promise<{ secret: string; qrCodeUrl: string }>;
  verifyMfaSetup: (secret: string, totpCode: string) => Promise<boolean>;
  disableMfa: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string; mfaEnabled: boolean; mfaSecret?: string } | null>(null);
  const navigate = useNavigate();

  // Mock user data for demonstration, in a real app this would come from a backend
  const [mockUsers, setMockUsers] = useState<{ [key: string]: { password: string; mfaEnabled: boolean; mfaSecret?: string } }>({
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
      });
    }
  }, [mockUsers]); // Depend on mockUsers to re-evaluate if user data changes

  const login = async (email: string, password: string, totpCode?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = mockUsers[email];
        if (!userData || userData.password !== password) {
          toast.error("Invalid credentials.");
          resolve(false);
          return;
        }

        if (userData.mfaEnabled) {
          if (!totpCode) {
            toast.info("MFA required. Please enter your TOTP code.");
            resolve(false); // Indicate that MFA is required
            return;
          }
          // Verify TOTP code
          const otp = new OTPAuth.TOTP({ secret: userData.mfaSecret });
          const isValid = otp.validate({ token: totpCode });

          if (isValid === null) {
            toast.error("Invalid TOTP code.");
            resolve(false);
            return;
          }
        }

        setIsAuthenticated(true);
        setUser({
          email,
          mfaEnabled: userData.mfaEnabled,
          mfaSecret: userData.mfaSecret,
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
    // In a real app, this secret would be generated and stored securely on the backend
    // and associated with the user. For this mock, we generate it client-side.
    const otp = new OTPAuth.TOTP({
      issuer: "ClassicPOS",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.randomKey(),
    });

    const secret = otp.secret.base32;
    const qrCodeUrl = otp.toString();

    // Temporarily store the secret for verification during setup
    // In a real app, this would be stored on the backend after verification
    setMockUsers((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        tempMfaSecret: secret, // Use a temporary key
      },
    }));

    return { secret, qrCodeUrl };
  }, []);

  const verifyMfaSetup = async (secret: string, totpCode: string): Promise<boolean> => {
    if (!user?.email) return false;

    const otp = new OTPAuth.TOTP({ secret });
    const isValid = otp.validate({ token: totpCode });

    if (isValid !== null) {
      // If valid, enable MFA and store the secret permanently for the mock user
      setMockUsers((prev) => ({
        ...prev,
        [user.email]: {
          ...prev[user.email],
          mfaEnabled: true,
          mfaSecret: secret,
          tempMfaSecret: undefined, // Clear temporary secret
        },
      }));
      setUser((prev) => prev ? { ...prev, mfaEnabled: true, mfaSecret: secret } : null);
      return true;
    }
    return false;
  };

  const disableMfa = async (): Promise<boolean> => {
    if (!user?.email) {
      toast.error("No user logged in.");
      return false;
    }

    // Simulate API call to disable MFA
    await new Promise((resolve) => setTimeout(resolve, 500));

    setMockUsers((prev) => ({
      ...prev,
      [user.email]: {
        ...prev[user.email],
        mfaEnabled: false,
        mfaSecret: undefined,
      },
    }));
    setUser((prev) => prev ? { ...prev, mfaEnabled: false, mfaSecret: undefined } : null);
    toast.success("MFA disabled successfully.");
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, generateMfaSecret, verifyMfaSetup, disableMfa }}>
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