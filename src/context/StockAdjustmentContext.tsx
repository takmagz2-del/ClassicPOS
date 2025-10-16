"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { StockAdjustment, AdjustmentType, InventoryHistoryType, StockAdjustmentItem } from "@/types/inventory";
import { toast } from "sonner";
import { useStores } from "./StoreContext";
import { useAuth } from "@/components/auth/AuthContext";
import { useProducts } from "./ProductContext";
import { useInventoryHistory } from "./InventoryHistoryContext";

interface StockAdjustmentContextType {
  stockAdjustments: StockAdjustment[];
  addStockAdjustment: (newAdjustment: Omit<StockAdjustment, "id" | "storeName" | "approvedByUserName" | "approvalDate">) => void;
  updateStockAdjustment: (updatedAdjustment: StockAdjustment) => void;
  approveStockAdjustment: (adjustmentId: string) => void;
  deleteStockAdjustment: (adjustmentId: string) => void;
  getStockAdjustmentById: (adjustmentId: string) => StockAdjustment | undefined;
}

const StockAdjustmentContext = createContext<StockAdjustmentContextType | undefined>(undefined);

export const StockAdjustmentProvider = ({ children }: { children: ReactNode }) => {
  const { stores } = useStores();
  const { user } = useAuth();
  const { updateProductStock, products, getEffectiveProductStock } = useProducts(); // Use the refactored updateProductStock and getEffectiveProductStock
  const { addHistoryEntry } = useInventoryHistory();

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    if (typeof window !== "undefined") {
      const storedAdjustments = localStorage.getItem("stockAdjustments");
      return storedAdjustments ? JSON.parse(storedAdjustments) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("stockAdjustments", JSON.stringify(stockAdjustments));
    }
  }, [stockAdjustments]);

  const addStockAdjustment = useCallback((newAdjustmentData: Omit<StockAdjustment, "id" | "storeName" | "approvedByUserName" | "approvalDate">) => {
    const store = stores.find(s => s.id === newAdjustmentData.storeId);

    if (!store) {
      toast.error("Invalid store selected for adjustment.");
      return;
    }

    const newAdjustment: StockAdjustment = {
      ...newAdjustmentData,
      id: crypto.randomUUID(),
      storeName: store.name,
      approvedByUserId: user?.id,
      approvedByUserName: user?.email,
      approvalDate: new Date().toISOString(),
    };

    // Apply stock changes immediately upon creation (assuming creation implies approval for now)
    newAdjustment.items.forEach(item => {
      const currentStockInStore = getEffectiveProductStock(item.productId, newAdjustment.storeId);
      
      const newStock = item.adjustmentType === AdjustmentType.Increase
        ? currentStockInStore + item.quantity
        : currentStockInStore - item.quantity;

      updateProductStock(
        item.productId,
        newStock,
        item.adjustmentType === AdjustmentType.Increase ? InventoryHistoryType.SA_INCREASE : InventoryHistoryType.SA_DECREASE,
        newAdjustment.id,
        `Stock adjusted: ${item.adjustmentType === AdjustmentType.Increase ? "Increased" : "Decreased"} by ${item.quantity} due to: ${item.reason}`,
        newAdjustment.storeId,
        user?.id,
        item.productName
      );
    });

    setStockAdjustments((prev) => [...prev, newAdjustment]);
    toast.success(`Stock Adjustment created and applied.`);
  }, [stores, user, getEffectiveProductStock, updateProductStock]);

  // For simplicity, approveStockAdjustment will just log a message if called,
  // as stock changes are applied on creation in this mock.
  const approveStockAdjustment = useCallback((adjustmentId: string) => {
    const adjustment = stockAdjustments.find(sa => sa.id === adjustmentId);
    if (adjustment) {
      toast.info(`Stock Adjustment "${adjustment.id.substring(0,8)}" is already applied.`);
    }
  }, [stockAdjustments]);


  const updateStockAdjustment = useCallback((updatedAdjustment: StockAdjustment) => {
    const store = stores.find(s => s.id === updatedAdjustment.storeId);
    if (!store) {
      toast.error("Invalid store selected for update.");
      return;
    }
    // In a real app, updating an adjustment would require reversing previous stock changes
    // and applying new ones. For this mock, we'll just update the record.
    setStockAdjustments((prev) =>
      prev.map((sa) => (sa.id === updatedAdjustment.id ? { ...updatedAdjustment, storeName: store.name } : sa))
    );
    toast.success(`Stock Adjustment "${updatedAdjustment.id.substring(0,8)}" updated.`);
  }, [stores]);

  const deleteStockAdjustment = useCallback((adjustmentId: string) => {
    // In a real app, deleting an adjustment would require reversing its stock changes.
    // For this mock, we'll just remove the record.
    setStockAdjustments((prev) => prev.filter((sa) => sa.id !== adjustmentId));
    toast.info("Stock Adjustment deleted.");
  }, []);

  const getStockAdjustmentById = useCallback((adjustmentId: string) => {
    return stockAdjustments.find(sa => sa.id === adjustmentId);
  }, [stockAdjustments]);

  return (
    <StockAdjustmentContext.Provider value={{ stockAdjustments, addStockAdjustment, updateStockAdjustment, approveStockAdjustment, deleteStockAdjustment, getStockAdjustmentById }}>
      {children}
    </StockAdjustmentContext.Provider>
  );
};

export const useStockAdjustments = () => {
  const context = useContext(StockAdjustmentContext);
  if (context === undefined) {
    throw new Error("useStockAdjustments must be used within a StockAdjustmentProvider");
  }
  return context;
};