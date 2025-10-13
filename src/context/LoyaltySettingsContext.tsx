"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

interface LoyaltySettingsContextType {
  isLoyaltyEnabled: boolean;
  toggleLoyaltyEnabled: (enabled: boolean) => void;
}

const defaultLoyaltySettings = {
  isLoyaltyEnabled: true, // Default to enabled
};

const LoyaltySettingsContext = createContext<LoyaltySettingsContextType | undefined>(undefined);

export const LoyaltySettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isLoyaltyEnabled, setIsLoyaltyEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const storedSettings = localStorage.getItem("loyaltySettings");
      return storedSettings ? JSON.parse(storedSettings).isLoyaltyEnabled : defaultLoyaltySettings.isLoyaltyEnabled;
    }
    return defaultLoyaltySettings.isLoyaltyEnabled;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("loyaltySettings", JSON.stringify({ isLoyaltyEnabled }));
    }
  }, [isLoyaltyEnabled]);

  const toggleLoyaltyEnabled = useCallback((enabled: boolean) => {
    setIsLoyaltyEnabled(enabled);
  }, []);

  return (
    <LoyaltySettingsContext.Provider value={{ isLoyaltyEnabled, toggleLoyaltyEnabled }}>
      {children}
    </LoyaltySettingsContext.Provider>
  );
};

export const useLoyaltySettings = () => {
  const context = useContext(LoyaltySettingsContext);
  if (context === undefined) {
    throw new Error("useLoyaltySettings must be used within a LoyaltySettingsProvider");
  }
  return context;
};