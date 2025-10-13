"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Sale } from "@/types/sale";

interface SaleContextType {
  salesHistory: Sale[];
  addSale: (sale: Sale) => void;
  refundSale: (refundTransaction: Sale) => void; // New: Function to add a refund transaction
  settleSale: (saleId: string) => void; // New: Function to settle a pending sale
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const [salesHistory, setSalesHistory] = useState<Sale[]>(() => {
    if (typeof window !== "undefined") {
      const storedSales = localStorage.getItem("salesHistory");
      return storedSales ? JSON.parse(storedSales) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
    }
  }, [salesHistory]);

  const addSale = (sale: Sale) => {
    setSalesHistory((prevSales) => [...prevSales, sale]);
  };

  const refundSale = (refundTransaction: Sale) => {
    setSalesHistory((prevSales) => [...prevSales, refundTransaction]);
  };

  const settleSale = (saleId: string) => {
    setSalesHistory((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId ? { ...sale, status: "completed" } : sale
      )
    );
  };

  return (
    <SaleContext.Provider value={{ salesHistory, addSale, refundSale, settleSale }}>
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