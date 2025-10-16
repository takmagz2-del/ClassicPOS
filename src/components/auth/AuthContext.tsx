"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TOTP, Secret } from "otpauth";
import { User, UserRole } from "@/types/user";
import { useLoading } from "@/context/LoadingContext";

interface LoginResult {
  success: boolean;
  mfaRequired?: boolean;
}

// Define a type for the internal mock user data, including password and temporary MFA/backup codes
interface InternalMockUser extends User {
  password: string;
  tempMfaSecret?: string;
  tempBackupCodes?: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, totpCode?: string, backupCode?: string) => Promise<LoginResult>;
  register: (email: string, password: string, businessName: string, businessType: string, country: string, phone?: string, vatNumber?: string, tinNumber?: string) => Promise<boolean>;
  logout: () => void;
  generateMfaSecret: (email: string) => Promise<{ secret: string; qrCodeUrl: string }>;
  verifyMfaSetup: (secret: string, totpCode: string) => Promise<boolean>;
  generateBackupCodes: (email: string) => Promise<string[]>;
  saveBackupCodes: (email: string, codes: string[]) => void;
  disableMfa: () => Promise<boolean>;
  users: User[];
  addUser: (email: string, password: string, role: UserRole) => Promise<boolean>;
  updateUser: (userId: string, updatedUser: Partial<User>, currentPassword?: string, newPassword?: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const [mockUsers, setMockUsers] = useState<{ [key: string]: InternalMockUser }>({
    "admin@example.com": { id: "u1", email: "admin@example.com", password: "password", mfaEnabled: false, role: UserRole.ADMIN, businessName: "Admin Corp", businessType: "Retail Store", country: "United States", phone: "+15551112222", vatNumber: "US123456789", tinNumber: "US987654321" },
    "manager@example.com": { id: "u2", email: "manager@example.com", password: "password", mfaEnabled: false, role: UserRole.MANAGER, businessName: "Manager Inc", businessType: "Restaurant/Cafe", country: "Canada", phone: "+15553334444", vatNumber: "CA123456789" },
    "employee@example.com": { id: "u3", email: "employee@example.com", password: "password", mfaEnabled: false, role: UserRole.EMPLOYEE, businessName: "Employee Co", businessType: "Service Business", country: "United Kingdom", phone: "+442079460123" },
  });

  const usersArray = Object.values(mockUsers).map(({ password, tempMfaSecret, tempBackupCodes, ...rest }) => rest);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUserEmail = localStorage.getItem("userEmail");
    if (token && storedUserEmail && mockUsers[storedUserEmail]) {
      setIsAuthenticated(true);
      const storedUser = mockUsers[storedUserEmail];
      setUser({
        id: storedUser.id,
        email: storedUser.email,
        mfaEnabled: storedUser.mfaEnabled,
        mfaSecret: storedUser.mfaSecret,
        backupCodes: storedUser.backupCodes,
        role: storedUser.role,
        businessName: storedUser.businessName,
        businessType: storedUser.businessType,
        country: storedUser.country,
        phone: storedUser.phone,
        vatNumber: storedUser.vatNumber,
        tinNumber: storedUser.tinNumber,
      });
    }
  }, [mockUsers]);

  const login = async (email: string, password: string, totpCode?: string, backupCode?: string): Promise<LoginResult> => {
    startLoading();
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = mockUsers[email];
        if (!userData || userData.password !== password) {
          toast.error("Invalid credentials.");
          stopLoading();
          resolve({ success: false });
          return;
        }

        if (userData.mfaEnabled) {
          if (!totpCode && !backupCode) {
            toast.info("MFA required. Please enter your TOTP code or a backup code.");
            stopLoading();
            resolve({ success: false, mfaRequired: true });
            return;
          }

          if (totpCode) {
            const otp = new TOTP({ secret: userData.mfaSecret });
            const isValid = otp.validate({ token: totpCode });

            if (isValid === null) {
              toast.error("Invalid TOTP code.");
              stopLoading();
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
              stopLoading();
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
          businessName: userData.businessName,
          businessType: userData.businessType,
          country: userData.country,
          phone: userData.phone,
          vatNumber: userData.vatNumber,
          tinNumber: userData.tinNumber,
        });
        localStorage.setItem("authToken", "mock-jwt-token");
        localStorage.setItem("userEmail", email);
        toast.success("Login successful!");
        
        // Redirect based on role
        if (userData.role === UserRole.EMPLOYEE) {
          navigate("/sales");
        } else {
          navigate("/");
        }
        
        stopLoading();
        resolve({ success: true });
      }, 1000);
    });
  };

  const register = async (email: string, password: string, businessName: string, businessType: string, country: string, phone?: string, vatNumber?: string, tinNumber?: string): Promise<boolean> => {
    startLoading();
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockUsers[email]) {
          toast.error("Account with this email already exists.");
          stopLoading();
          resolve(false);
          return;
        }

        const isFirstUser = Object.keys(mockUsers).length === 0;
        const assignedRole = isFirstUser ? UserRole.ADMIN : UserRole.EMPLOYEE;

        const newUserId = crypto.randomUUID();
        setMockUsers((prev) => ({
          ...prev,
          [email]: {
            id: newUserId,
            email,
            password,
            mfaEnabled: false,
            role: assignedRole, // Assign role dynamically
            businessName,
            businessType,
            country,
            phone,
            vatNumber,
            tinNumber,
          },
        }));
        toast.success("Account created successfully! Please log in.");
        stopLoading();
        resolve(true);
      }, 1000);
    });
  };

  const logout = () => {
    startLoading();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    toast.info("Logged out successfully.");
    navigate("/login");
    stopLoading();
  };

  const generateMfaSecret = useCallback(async (email: string) => {
    startLoading();
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
    stopLoading();
    return { secret, qrCodeUrl };
  }, [startLoading, stopLoading]);

  const verifyMfaSetup = async (secret: string, totpCode: string): Promise<boolean> => {
    startLoading();
    if (!user?.email) {
      stopLoading();
      return false;
    }

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
      stopLoading();
      return true;
    }
    stopLoading();
    return false;
  };

  const generateBackupCodes = useCallback(async (email: string): Promise<string[]> => {
    startLoading();
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
    stopLoading();
    return codes;
  }, [startLoading, stopLoading]);

  const saveBackupCodes = useCallback((email: string, codes: string[]) => {
    startLoading();
    setMockUsers((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        backupCodes: codes,
        tempBackupCodes: undefined,
      },
    }));
    setUser((prev) => prev ? { ...prev, backupCodes: codes } : null);
    stopLoading();
  }, [startLoading, stopLoading]);

  const disableMfa = async (): Promise<boolean> => {
    startLoading();
    if (!user?.email) {
      toast.error("No user logged in.");
      stopLoading();
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
    stopLoading();
    return true;
  };

  const addUser = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    startLoading();
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockUsers[email]) {
          toast.error("User with this email already exists.");
          stopLoading();
          resolve(false);
          return;
        }
        const newUserId = crypto.randomUUID();
        setMockUsers((prev) => ({
          ...prev,
          [email]: { id: newUserId, email, password, mfaEnabled: false, role },
        }));
        toast.success(`User ${email} (${role}) added successfully.`);
        stopLoading();
        resolve(true);
      }, 500);
    });
  };

  const updateUser = async (userId: string, updatedUser: Partial<User>, currentPassword?: string, newPassword?: string): Promise<boolean> => {
    startLoading();
    return new Promise((resolve) => {
      setTimeout(() => {
        // Find the user to update by ID
        const userToUpdateEntry = Object.entries(mockUsers).find(([, u]) => u.id === userId);

        if (!userToUpdateEntry) {
          toast.error("User not found.");
          stopLoading();
          resolve(false);
          return;
        }

        const [oldEmailKey, existingUser] = userToUpdateEntry;
        const newEmailKey = updatedUser.email || oldEmailKey;

        // Check if the new email already exists for another user
        if (newEmailKey !== oldEmailKey && mockUsers[newEmailKey] && mockUsers[newEmailKey].id !== userId) {
          toast.error("Another user with this email already exists.");
          stopLoading();
          resolve(false);
          return;
        }

        // Handle password change
        if (newPassword) {
          // If the logged-in user is updating their own password, require currentPassword
          if (user?.id === userId) {
            if (!currentPassword || existingUser.password !== currentPassword) {
              toast.error("Incorrect current password.");
              stopLoading();
              resolve(false);
              return;
            }
          }
          // For admin updating another user, or if it's the current user and currentPassword was correct
          existingUser.password = newPassword;
        }

        // Create the updated user data
        const newUserData: InternalMockUser = {
          ...existingUser,
          ...updatedUser,
          email: newEmailKey, // Ensure email is updated
          role: updatedUser.role || existingUser.role, // Ensure role is not undefined
          vatNumber: updatedUser.vatNumber !== undefined ? updatedUser.vatNumber : existingUser.vatNumber,
          tinNumber: updatedUser.tinNumber !== undefined ? updatedUser.tinNumber : existingUser.tinNumber,
        };

        setMockUsers((prev) => {
          const newMockUsers = { ...prev };
          // If email changed, delete the old entry
          if (oldEmailKey !== newEmailKey) {
            delete newMockUsers[oldEmailKey];
          }
          newMockUsers[newEmailKey] = newUserData; // Add/overwrite with new email as key
          return newMockUsers;
        });

        // If the currently logged-in user is being updated
        if (user?.id === userId) {
          setUser({
            id: newUserData.id,
            email: newUserData.email,
            mfaEnabled: newUserData.mfaEnabled,
            mfaSecret: newUserData.mfaSecret,
            backupCodes: newUserData.backupCodes,
            role: newUserData.role,
            businessName: newUserData.businessName,
            businessType: newUserData.businessType,
            country: newUserData.country,
            phone: newUserData.phone,
            vatNumber: newUserData.vatNumber,
            tinNumber: newUserData.tinNumber,
          });
          // Update localStorage if the logged-in user's email changed
          if (user.email !== newUserData.email) {
            localStorage.setItem("userEmail", newUserData.email);
          }
        }
        toast.success(`User ${newUserData.email} updated successfully.`);
        stopLoading();
        resolve(true);
      }, 500);
    });
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    startLoading();
    return new Promise((resolve) => {
      setTimeout(() => {
        const userToDelete = Object.values(mockUsers).find(u => u.id === userId);
        if (!userToDelete) {
          toast.error("User not found.");
          stopLoading();
          resolve(false);
          return;
        }
        if (userToDelete.id === user?.id) {
          toast.error("Cannot delete your own account while logged in.");
          stopLoading();
          return false;
        }

        const newMockUsers = { ...mockUsers };
        delete newMockUsers[userToDelete.email];
        setMockUsers(newMockUsers);
        toast.success(`User ${userToDelete.email} deleted successfully.`);
        stopLoading();
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
      users: usersArray,
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