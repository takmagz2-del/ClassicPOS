"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TOTP, Secret } from "otpauth";
import { User, UserRole } from "@/types/user"; // Import User and UserRole

interface LoginResult {
  success: boolean;
  mfaRequired?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // Updated user type
  login: (email: string, password: string, totpCode?: string, backupCode?: string) => Promise<LoginResult>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  generateMfaSecret: (email: string) => Promise<{ secret: string; qrCodeUrl: string }>;
  verifyMfaSetup: (secret: string, totpCode: string) => Promise<boolean>;
  generateBackupCodes: (email: string) => Promise<string[]>;
  saveBackupCodes: (email: string, codes: string[]) => void;
  disableMfa: () => Promise<boolean>;
  // New user management functions
  users: User[];
  addUser: (email: string, password: string, role: UserRole) => Promise<boolean>;
  updateUser: (updatedUser: User) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null); // Updated user type
  const navigate = useNavigate();

  // Mock user data for demonstration, in a real app this would come from a backend
  const [mockUsers, setMockUsers] = useState<{ [key: string]: User & { password: string; tempMfaSecret?: string; tempBackupCodes?: string[] } }>({
    "admin@example.com": { id: "u1", email: "admin@example.com", password: "password", mfaEnabled: false, role: UserRole.ADMIN },
    "manager@example.com": { id: "u2", email: "manager@example.com", password: "password", mfaEnabled: false, role: UserRole.MANAGER },
    "employee@example.com": { id: "u3", email: "employee@example.com", password: "password", mfaEnabled: false, role: UserRole.EMPLOYEE },
  });

  // Convert mockUsers object to an array for easier iteration in UI
  const usersArray = Object.values(mockUsers).map(({ password, tempMfaSecret, tempBackupCodes, ...rest }) => rest);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUserEmail = localStorage.getItem("userEmail");
    if (token && storedUserEmail && mockUsers[storedUserEmail]) {
      setIsAuthenticated(true);
      setUser({
        id: mockUsers[storedUserEmail].id,
        email: storedUserEmail,
        mfaEnabled: mockUsers[storedUserEmail].mfaEnabled,
        mfaSecret: mockUsers[storedUserEmail].mfaSecret,
        backupCodes: mockUsers[storedUserEmail].backupCodes,
        role: mockUsers[storedUserEmail].role,
      });
    }
  }, [mockUsers]);

  const login = async (email: string, password: string, totpCode?: string, backupCode?: string): Promise<LoginResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = mockUsers[email];
        if (!userData || userData.password !== password) {
          toast.error("Invalid credentials.");
          resolve({ success: false });
          return;
        }

        if (userData.mfaEnabled) {
          if (!totpCode && !backupCode) {
            toast.info("MFA required. Please enter your TOTP code or a backup code.");
            resolve({ success: false, mfaRequired: true });
            return;
          }

          if (totpCode) {
            const otp = new TOTP({ secret: userData.mfaSecret });
            const isValid = otp.validate({ token: totpCode });

            if (isValid === null) {
              toast.error("Invalid TOTP code.");
              resolve({ success: false });
              return;
            }
          } else if (backupCode) {
            const codeIndex = userData.backupCodes?.indexOf(backupCode);
            if (codeIndex !== undefined && codeIndex > -1) {
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
              resolve({ success: false });
              return;
            }
          }
        }

        setIsAuthenticated(true);
        setUser({
          id: userData.id,
          email,
          mfaEnabled: userData.mfaEnabled,
          mfaSecret: userData.mfaSecret,
          backupCodes: userData.backupCodes,
          role: userData.role,
        });
        localStorage.setItem("authToken", "mock-jwt-token");
        localStorage.setItem("userEmail", email);
        toast.success("Login successful!");
        navigate("/");
        resolve({ success: true });
      }, 1000);
    });
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockUsers[email]) {
          toast.error("Account with this email already exists.");
          resolve(false);
          return;
        }

        const newUserId = crypto.randomUUID();
        setMockUsers((prev) => ({
          ...prev,
          [email]: { id: newUserId, email, password, mfaEnabled: false, role: UserRole.EMPLOYEE }, // Default role for new registrations
        }));
        toast.success("Account created successfully! Please log in.");
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
    const randomBytes = crypto.getRandomValues(new Uint8Array(20));
    const secretInstance = new Secret(randomBytes);

    const otp = new TOTP({
      issuer: "ClassicPOS",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secretInstance.base32,
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

    const otp = new TOTP({ secret });
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
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomUUID().substring(0, 8).toUpperCase());
    }
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
        tempBackupCodes: undefined,
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
        backupCodes: undefined,
      },
    }));
    setUser((prev) => prev ? { ...prev, mfaEnabled: false, mfaSecret: undefined, backupCodes: undefined } : null);
    toast.success("MFA disabled successfully.");
    return true;
  };

  // New User Management Functions
  const addUser = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockUsers[email]) {
          toast.error("User with this email already exists.");
          resolve(false);
          return;
        }
        const newUserId = crypto.randomUUID();
        setMockUsers((prev) => ({
          ...prev,
          [email]: { id: newUserId, email, password, mfaEnabled: false, role },
        }));
        toast.success(`User ${email} (${role}) added successfully.`);
        resolve(true);
      }, 500);
    });
  };

  const updateUser = async (updatedUser: User): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!mockUsers[updatedUser.email]) {
          toast.error("User not found.");
          resolve(false);
          return;
        }
        setMockUsers((prev) => ({
          ...prev,
          [updatedUser.email]: {
            ...prev[updatedUser.email],
            ...updatedUser,
          },
        }));
        // If the current logged-in user is being updated, refresh their session data
        if (user?.id === updatedUser.id) {
          setUser(updatedUser);
        }
        toast.success(`User ${updatedUser.email} updated successfully.`);
        resolve(true);
      }, 500);
    });
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userToDelete = Object.values(mockUsers).find(u => u.id === userId);
        if (!userToDelete) {
          toast.error("User not found.");
          resolve(false);
          return;
        }
        if (userToDelete.id === user?.id) {
          toast.error("Cannot delete your own account while logged in.");
          resolve(false);
          return;
        }

        const newMockUsers = { ...mockUsers };
        delete newMockUsers[userToDelete.email];
        setMockUsers(newMockUsers);
        toast.success(`User ${userToDelete.email} deleted successfully.`);
        resolve(true);
      }, 500);
    });
  };

  const hasPermission = useCallback((requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      register,
      logout,
      generateMfaSecret,
      verifyMfaSetup,
      generateBackupCodes,
      saveBackupCodes,
      disableMfa,
      users: usersArray, // Provide the array of users
      addUser,
      updateUser,
      deleteUser,
      hasPermission,
    }}>
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