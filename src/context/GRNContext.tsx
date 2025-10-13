"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { GoodsReceivedNote, GRNStatus, GRNItem, InventoryHistoryType, PurchaseOrder } from "@/types/inventory";
import { toast } from "sonner";
import { useSuppliers } from "./SupplierContext";
import { useStores } from "./StoreContext";
import { useAuth } from "@/components/auth/AuthContext";
import { useProducts } from "./ProductContext"; // Import useProducts
import { useInventoryHistory } from "./InventoryHistoryContext";
import { usePurchaseOrders } from "./PurchaseOrderContext";

interface GRNContextType {
  grns: GoodsReceivedNote[];
  addGRN: (newGRN: Omit<GoodsReceivedNote, "id" | "status" | "supplierName" | "receivingStoreName" | "approvedByUserName" | "approvalDate">) => void;
  updateGRN: (updatedGRN: GoodsReceivedNote) => void;
  approveGRN: (grnId: string) => void;
  deleteGRN: (grnId: string) => void;
  getGRNById: (grnId: string) => GoodsReceivedNote | undefined;
}

const GRNContext = createContext<GRNContextType | undefined>(undefined);

export const GRNProvider = ({ children }: { children: ReactNode }) => {
  const { suppliers } = useSuppliers();
  const { stores } = useStores();
  const { user } = useAuth();
  const { updateProductStock, products } = useProducts(); // Destructure products here
  const { addHistoryEntry } = useInventoryHistory();
  const { updatePurchaseOrder, getPurchaseOrderById } = usePurchaseOrders();

  const [grns, setGRNs] = useState<GoodsReceivedNote[]>(() => {
    if (typeof window !== "undefined") {
      const storedGRNs = localStorage.getItem("goodsReceivedNotes");
      return storedGRNs ? JSON.parse(storedGRNs) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("goodsReceivedNotes", JSON.stringify(grns));
    }
  }, [grns]);

  const addGRN = useCallback((newGRNData: Omit<GoodsReceivedNote, "id" | "status" | "supplierName" | "receivingStoreName" | "approvedByUserName" | "approvalDate">) => {
    const supplier = suppliers.find(s => s.id === newGRNData.supplierId);
    const store = stores.find(s => s.id === newGRNData.receivingStoreId);

    if (!supplier || !store) {
      toast.error("Invalid supplier or receiving store selected.");
      return;
    }

    const newGRN: GoodsReceivedNote = {
      ...newGRNData,
      id: crypto.randomUUID(),
      status: "pending",
      supplierName: supplier.name,
      receivingStoreName: store.name,
    };
    setGRNs((prev) => [...prev, newGRN]);
    toast.success(`Goods Received Note "${newGRN.referenceNo}" created.`);
  }, [suppliers, stores]);

  const updateGRN = useCallback((updatedGRN: GoodsReceivedNote) => {
    setGRNs((prev) =>
      prev.map((grn) => (grn.id === updatedGRN.id ? updatedGRN : grn))
    );
    toast.success(`Goods Received Note "${updatedGRN.referenceNo}" updated.`);
  }, []);

  const approveGRN = useCallback((grnId: string) => {
    setGRNs((prev) => {
      const updatedGRNs = prev.map((grn) => {
        if (grn.id === grnId && grn.status === "pending") {
          // Update stock for each item
          grn.items.forEach(item => {
            // Use the refactored updateProductStock
            const product = products.find(p => p.id === item.productId);
            if (product) {
              updateProductStock(
                item.productId,
                product.stock + item.quantityReceived,
                InventoryHistoryType.GRN,
                grn.id,
                `Received ${item.quantityReceived}x ${item.productName} from ${grn.supplierName}`,
                grn.receivingStoreId,
                user?.id
              );
            }
          });

          // If linked to a PO, update PO status (simplified to 'completed')
          if (grn.purchaseOrderId) {
            const po = getPurchaseOrderById(grn.purchaseOrderId);
            if (po) {
              updatePurchaseOrder({ ...po, status: "completed" });
            }
          }

          toast.success(`Goods Received Note "${grn.referenceNo}" approved and stock updated.`);
          return {
            ...grn,
            status: "approved" as GRNStatus, // Explicitly cast to GRNStatus
            approvedByUserId: user?.id,
            approvedByUserName: user?.email,
            approvalDate: new Date().toISOString(),
          };
        }
        return grn;
      });
      return updatedGRNs;
    });
  }, [updateProductStock, user, getPurchaseOrderById, updatePurchaseOrder, products]); // products is now correctly in scope

  const deleteGRN = useCallback((grnId: string) => {
    setGRNs((prev) => prev.filter((grn) => grn.id !== grnId));
    toast.info("Goods Received Note deleted.");
  }, []);

  const getGRNById = useCallback((grnId: string) => {
    return grns.find(grn => grn.id === grnId);
  }, [grns]);

  return (
    <GRNContext.Provider value={{ grns, addGRN, updateGRN, approveGRN, deleteGRN, getGRNById }}>
      {children}
    </GRNContext.Provider>
  );
};

export const useGRNs = () => {
  const context = useContext(GRNContext);
  if (context === undefined) {
    throw new Error("useGRNs must be used within a GRNProvider");
  }
  return context;
};