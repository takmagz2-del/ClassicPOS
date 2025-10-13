"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Sale } from "@/types/sale";
import { toast } from "sonner"; // Import toast for notifications

interface SaleContextType {
  salesHistory: Sale[];
  heldSales: Sale[]; // New: State for held sales
  addSale: (sale: Sale) => void;
  refundSale: (refundTransaction: Sale) => void;
  settleSale: (saleId: string) => void;
  holdSale: (sale: Sale) => void; // New: Function to hold a sale
  resumeSale: (saleId: string) => Sale | undefined; // New: Function to resume a sale
  removeHeldSale: (saleId: string) => void; // New: Function to remove a held sale
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

  const [heldSales, setHeldSales] = useState<Sale[]>(() => {
    if (typeof window !== "undefined") {
      const storedHeldSales = localStorage.getItem("heldSales");
      return storedHeldSales ? JSON.parse(storedHeldSales) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
    }
  }, [salesHistory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("heldSales", JSON.stringify(heldSales));
    }
  }, [heldSales]);

  const addSale = useCallback((sale: Sale) => {
    setSalesHistory((prevSales) => [...prevSales, sale]);
  }, []);

  const refundSale = useCallback((refundTransaction: Sale) => {
    setSalesHistory((prevSales) => [...prevSales, refundTransaction]);
  }, []);

  const settleSale = useCallback((saleId: string) => {
    setSalesHistory((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId ? { ...sale, status: "completed" } : sale
      )
    );
  }, []);

  const holdSale = useCallback((sale: Sale) => {
    setHeldSales((prevHeldSales) => {
      // Check if a sale with the same ID is already on hold (e.g., if editing a held sale)
      const existingIndex = prevHeldSales.findIndex(s => s.id === sale.id);
      if (existingIndex > -1) {
        const updatedHeldSales = [...prevHeldSales];
        updatedHeldSales[existingIndex] = sale;
        toast.success(`Held sale "${sale.id.substring(0, 8)}" updated.`);
        return updatedHeldSales;
      } else {
        toast.success(`Sale "${sale.id.substring(0, 8)}" put on hold.`);
        return [...prevHeldSales, { ...sale, status: "on-hold" }];
      }
    });
  }, []);

  const resumeSale = useCallback((saleId: string): Sale | undefined => {
    let resumedSale: Sale | undefined;
    setHeldSales((prevHeldSales) => {
      const index = prevHeldSales.findIndex((sale) => sale.id === saleId);
      if (index > -1) {
        resumedSale = { ...prevHeldSales[index], status: "pending" }; // Change status back to pending or active
        const newHeldSales = prevHeldSales.filter((_, i) => i !== index);
        toast.info(`Sale "${saleId.substring(0, 8)}" resumed.`);
        return newHeldSales;
      }
      return prevHeldSales;
    });
    return resumedSale;
  }, []);

  const removeHeldSale = useCallback((saleId: string) => {
    setHeldSales((prevHeldSales) => {
      const newHeldSales = prevHeldSales.filter((sale) => sale.id !== saleId);
      toast.info(`Held sale "${saleId.substring(0, 8)}" removed.`);
      return newHeldSales;
    });
  }, []);

  return (
    <SaleContext.Provider value={{ salesHistory, heldSales, addSale, refundSale, settleSale, holdSale, resumeSale, removeHeldSale }}>
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