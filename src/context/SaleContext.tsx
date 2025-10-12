"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Sale } from "@/types/sale";

interface SaleContextType {
  salesHistory: Sale[];
  addSale: (sale: Sale) => void;
  refundSale: (refundTransaction: Sale) => void; // New: Function to add a refund transaction
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);

  const addSale = (sale: Sale) => {
    setSalesHistory((prevSales) => [...prevSales, sale]);
  };

  const refundSale = (refundTransaction: Sale) => {
    setSalesHistory((prevSales) => [...prevSales, refundTransaction]);
  };

  return (
    <SaleContext.Provider value={{ salesHistory, addSale, refundSale }}>
      {children}
    </SaleContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SaleContext);
  if (context === undefined) {
    throw new Error("useSales must be used within a SaleProvider");
  }
  return context;
};