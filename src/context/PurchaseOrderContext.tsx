"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from "@/types/inventory";
import { toast } from "sonner";
import { useSuppliers } from "./SupplierContext";

interface PurchaseOrderContextType {
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (newOrder: Omit<PurchaseOrder, "id">) => void;
  updatePurchaseOrder: (updatedOrder: PurchaseOrder) => void;
  deletePurchaseOrder: (orderId: string) => void;
  getPurchaseOrderById: (orderId: string) => PurchaseOrder | undefined;
}

const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

export const PurchaseOrderProvider = ({ children }: { children: ReactNode }) => {
  const { suppliers } = useSuppliers();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    if (typeof window !== "undefined") {
      const storedOrders = localStorage.getItem("purchaseOrders");
      return storedOrders ? JSON.parse(storedOrders) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("purchaseOrders", JSON.stringify(purchaseOrders));
    }
  }, [purchaseOrders]);

  const addPurchaseOrder = useCallback((newOrderData: Omit<PurchaseOrder, "id">) => {
    const newOrder: PurchaseOrder = { ...newOrderData, id: crypto.randomUUID() };
    setPurchaseOrders((prev) => [...prev, newOrder]);
    toast.success(`Purchase Order "${newOrder.referenceNo}" created.`);
  }, []);

  const updatePurchaseOrder = useCallback((updatedOrder: PurchaseOrder) => {
    setPurchaseOrders((prev) =>
      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
    toast.success(`Purchase Order "${updatedOrder.referenceNo}" updated.`);
  }, []);

  const deletePurchaseOrder = useCallback((orderId: string) => {
    setPurchaseOrders((prev) => prev.filter((order) => order.id !== orderId));
    toast.info("Purchase Order deleted.");
  }, []);

  const getPurchaseOrderById = useCallback((orderId: string) => {
    return purchaseOrders.find(po => po.id === orderId);
  }, [purchaseOrders]);

  return (
    <PurchaseOrderContext.Provider value={{ purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, getPurchaseOrderById }}>
      {children}
    </PurchaseOrderContext.Provider>
  );
};

export const usePurchaseOrders = () => {
  const context = useContext(PurchaseOrderContext);
  if (context === undefined) {
    throw new Error("usePurchaseOrders must be used within a PurchaseOrderProvider");
  }
  return context;
};