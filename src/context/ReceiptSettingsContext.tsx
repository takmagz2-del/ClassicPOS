"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { ReceiptSettings } from "@/types/receipt";

interface ReceiptSettingsContextType {
  receiptSettings: ReceiptSettings;
  updateReceiptSettings: (newSettings: Partial<ReceiptSettings>) => void;
}

const defaultReceiptSettings: ReceiptSettings = {
  storeName: "ClassicPOS Store",
  storeAddress: "123 Main St, Anytown, USA 12345",
  storePhone: "(555) 123-4567",
  storeWebsite: "www.classicpos.com",
  thankYouMessage: "Thank you for your purchase!",
  logoUrl: "",
  showSku: true,
  showCategory: false,
  showCustomerInfo: true,
  showVatTin: false, // Added missing property
};

const ReceiptSettingsContext = createContext<ReceiptSettingsContextType | undefined>(undefined);

export const ReceiptSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(() => {
    if (typeof window !== "undefined") {
      const storedSettings = localStorage.getItem("receiptSettings");
      return storedSettings ? JSON.parse(storedSettings) : defaultReceiptSettings;
    }
    return defaultReceiptSettings;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("receiptSettings", JSON.stringify(receiptSettings));
    }
  }, [receiptSettings]);

  const updateReceiptSettings = useCallback((newSettings: Partial<ReceiptSettings>) => {
    setReceiptSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  }, []);

  return (
    <ReceiptSettingsContext.Provider value={{ receiptSettings, updateReceiptSettings }}>
      {children}
    </ReceiptSettingsContext.Provider>
  );
};

export const useReceiptSettings = () => {
  const context = useContext(ReceiptSettingsContext);
  if (context === undefined) {
    throw new Error("useReceiptSettings must be used within a ReceiptSettingsProvider");
  }
  return context;
};