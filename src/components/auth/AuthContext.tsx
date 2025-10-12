"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you'd check for a valid token in localStorage/sessionStorage
    // For now, we'll assume no one is logged in initially.
    const token = localStorage.getItem("authToken");
    if (token) {
      // Simulate token validation
      setIsAuthenticated(true);
      setUser({ email: "user@example.com" }); // Placeholder user
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call for login
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === "admin@example.com" && password === "password") {
          setIsAuthenticated(true);
          setUser({ email });
          localStorage.setItem("authToken", "mock-jwt-token"); // Store a mock token
          toast.success("Login successful!");
          navigate("/"); // Redirect to home page
          resolve(true);
        } else {
          toast.error("Invalid credentials.");
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("authToken");
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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