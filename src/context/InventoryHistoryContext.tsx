"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { InventoryHistoryEntry, InventoryHistoryType } from "@/types/inventory";
import { useAuth } from "@/components/auth/AuthContext";
import { useStores } from "./StoreContext";
import { useProducts } from "./ProductContext";

interface InventoryHistoryContextType {
  history: InventoryHistoryEntry[];
  addHistoryEntry: (entry: Omit<InventoryHistoryEntry, "id" | "date" | "userName" | "storeName" | "productName">) => void;
}

const InventoryHistoryContext = createContext<InventoryHistoryContextType | undefined>(undefined);

export const InventoryHistoryProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { stores } = useStores();
  const { products } = useProducts();

  const [history, setHistory] = useState<InventoryHistoryEntry[]>(() => {
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem("inventoryHistory");
      return storedHistory ? JSON.parse(storedHistory) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("inventoryHistory", JSON.stringify(history));
    }
  }, [history]);

  const addHistoryEntry = useCallback((entry: Omit<InventoryHistoryEntry, "id" | "date" | "userName" | "storeName" | "productName">) => {
    const newEntry: InventoryHistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      userName: user?.email || "System",
      storeName: entry.storeId ? stores.find(s => s.id === entry.storeId)?.name : undefined,
      productName: entry.productId ? products.find(p => p.id === entry.productId)?.name : undefined,
    };
    setHistory((prev) => [...prev, newEntry]);
  }, [user, stores, products]);

  return (
    <InventoryHistoryContext.Provider value={{ history, addHistoryEntry }}>
      {children}
    </InventoryHistoryContext.Provider>
  );
};

export const useInventoryHistory = () => {
  const context = useContext(InventoryHistoryContext);
  if (context === undefined) {
    throw new Error("useInventoryHistory must be used within an InventoryHistoryProvider");
  }
  return context;
};