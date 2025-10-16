"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

interface LoyaltySettingsContextType {
  isLoyaltyEnabled: boolean;
  toggleLoyaltyEnabled: (enabled: boolean) => void;
  pointsToCurrencyRate: number; // New: Conversion rate
}

const defaultLoyaltySettings = {
  isLoyaltyEnabled: true, // Default to enabled
  pointsToCurrencyRate: 100, // Default conversion: 100 points = 1 unit of currency
};

const LoyaltySettingsContext = createContext<LoyaltySettingsContextType | undefined>(undefined);

export const LoyaltySettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<{ isLoyaltyEnabled: boolean; pointsToCurrencyRate: number }>(() => {
    if (typeof window !== "undefined") {
      const storedSettings = localStorage.getItem("loyaltySettings");
      return storedSettings ? JSON.parse(storedSettings) : defaultLoyaltySettings;
    }
    return defaultLoyaltySettings;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("loyaltySettings", JSON.stringify(settings));
    }
  }, [settings]);

  const toggleLoyaltyEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, isLoyaltyEnabled: enabled }));
  }, []);

  // For now, pointsToCurrencyRate is fixed, but could be made configurable later
  const pointsToCurrencyRate = settings.pointsToCurrencyRate;

  return (
    <LoyaltySettingsContext.Provider value={{ isLoyaltyEnabled: settings.isLoyaltyEnabled, toggleLoyaltyEnabled, pointsToCurrencyRate }}>
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