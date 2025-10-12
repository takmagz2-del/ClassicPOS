"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Currency, mockCurrencies } from "@/types/currency";

interface CurrencyContextType {
  currentCurrency: Currency;
  availableCurrencies: Currency[];
  setCurrentCurrencyCode: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(
    mockCurrencies.find(c => c.code === localStorage.getItem("selectedCurrencyCode")) || mockCurrencies[0]
  );

  useEffect(() => {
    localStorage.setItem("selectedCurrencyCode", currentCurrency.code);
  }, [currentCurrency]);

  const setCurrentCurrencyCode = useCallback((code: string) => {
    const newCurrency = mockCurrencies.find(c => c.code === code);
    if (newCurrency) {
      setCurrentCurrency(newCurrency);
    }
  }, []);

  return (
    <CurrencyContext.Provider value={{ currentCurrency, availableCurrencies: mockCurrencies, setCurrentCurrencyCode }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};