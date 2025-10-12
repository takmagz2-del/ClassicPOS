"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Sale } from "@/types/sale";

interface SaleContextType {
  salesHistory: Sale[];
  addSale: (sale: Sale) => void;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);

  const addSale = (sale: Sale) => {
    setSalesHistory((prevSales) => [...prevSales, sale]);
  };

  return (
    <SaleContext.Provider value={{ salesHistory, addSale }}>
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