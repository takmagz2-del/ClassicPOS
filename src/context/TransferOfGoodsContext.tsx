"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { TransferOfGoods, TransferStatus, InventoryHistoryType, TransferOfGoodsItem } from "@/types/inventory";
import { toast } from "sonner";
import { useStores } from "./StoreContext";
import { useAuth } from "@/components/auth/AuthContext";
import { useProducts } from "./ProductContext";
import { useInventoryHistory } from "./InventoryHistoryContext";

interface TransferOfGoodsContextType {
  transfers: TransferOfGoods[];
  addTransfer: (newTransfer: Omit<TransferOfGoods, "id" | "status" | "transferFromStoreName" | "transferToStoreName" | "approvedByUserName" | "approvalDate" | "receivedByUserName" | "receivedDate">) => void;
  updateTransferStatus: (transferId: string, newStatus: TransferStatus, userId?: string) => void;
  deleteTransfer: (transferId: string) => void;
  getTransferById: (transferId: string) => TransferOfGoods | undefined;
}

const TransferOfGoodsContext = createContext<TransferOfGoodsContextType | undefined>(undefined);

export const TransferOfGoodsProvider = ({ children }: { children: ReactNode }) => {
  const { stores } = useStores();
  const { user } = useAuth();
  const { updateProductStock, products } = useProducts(); // Use the refactored updateProductStock
  const { addHistoryEntry } = useInventoryHistory();

  const [transfers, setTransfers] = useState<TransferOfGoods[]>(() => {
    if (typeof window !== "undefined") {
      const storedTransfers = localStorage.getItem("transferOfGoods");
      return storedTransfers ? JSON.parse(storedTransfers) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("transferOfGoods", JSON.stringify(transfers));
    }
  }, [transfers]);

  const addTransfer = useCallback((newTransferData: Omit<TransferOfGoods, "id" | "status" | "transferFromStoreName" | "transferToStoreName" | "approvedByUserName" | "approvalDate" | "receivedByUserName" | "receivedDate">) => {
    const fromStore = stores.find(s => s.id === newTransferData.transferFromStoreId);
    const toStore = stores.find(s => s.id === newTransferData.transferToStoreId);

    if (!fromStore || !toStore) {
      toast.error("Invalid 'From' or 'To' store selected.");
      return;
    }
    if (fromStore.id === toStore.id) {
      toast.error("Cannot transfer to the same store.");
      return;
    }

    // Check if enough stock is available in the 'from' store
    for (const item of newTransferData.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        toast.error(`Insufficient stock for ${item.productName} in ${fromStore.name}. Available: ${product?.stock || 0}`);
        return;
      }
    }

    const newTransfer: TransferOfGoods = {
      ...newTransferData,
      id: crypto.randomUUID(),
      status: "pending",
      transferFromStoreName: fromStore.name,
      transferToStoreName: toStore.name,
      approvedByUserId: user?.id, // Assuming creator approves for simplicity
      approvedByUserName: user?.email,
      approvalDate: new Date().toISOString(),
    };

    setTransfers((prev) => [...prev, newTransfer]);
    toast.success(`Transfer of Goods "${newTransfer.id.substring(0,8)}" created.`);
  }, [stores, user, products]);

  const updateTransferStatus = useCallback((transferId: string, newStatus: TransferStatus, actingUserId?: string) => {
    setTransfers((prev) => {
      const updatedTransfers = prev.map((transfer) => {
        if (transfer.id === transferId) {
          const actingUser = user || { id: actingUserId, email: "System" }; // Fallback for system actions

          if (newStatus === "in-transit" && transfer.status === "pending") {
            // Deduct stock from 'from' store
            transfer.items.forEach(item => {
              const product = products.find(p => p.id === item.productId);
              if (product) {
                updateProductStock(
                  item.productId,
                  product.stock - item.quantity,
                  InventoryHistoryType.TOG_OUT,
                  transfer.id,
                  `Transferred ${item.quantity}x ${item.productName} out to ${transfer.transferToStoreName}`,
                  transfer.transferFromStoreId,
                  actingUser?.id
                );
              }
            });
            toast.success(`Transfer "${transfer.id.substring(0,8)}" is now In Transit.`);
            return { ...transfer, status: newStatus };
          } else if (newStatus === "received" && transfer.status === "in-transit") {
            // Add stock to 'to' store
            transfer.items.forEach(item => {
              const product = products.find(p => p.id === item.productId);
              if (product) {
                updateProductStock(
                  item.productId,
                  product.stock + item.quantity,
                  InventoryHistoryType.TOG_IN,
                  transfer.id,
                  `Received ${item.quantity}x ${item.productName} from ${transfer.transferFromStoreName}`,
                  transfer.transferToStoreId,
                  actingUser?.id
                );
              }
            });
            toast.success(`Transfer "${transfer.id.substring(0,8)}" received at ${transfer.transferToStoreName}.`);
            return {
              ...transfer,
              status: newStatus,
              receivedByUserId: actingUser?.id,
              receivedByUserName: actingUser?.email,
              receivedDate: new Date().toISOString(),
            };
          } else if (newStatus === "rejected" && (transfer.status === "pending" || transfer.status === "in-transit")) {
            // If rejected while in-transit, return stock to 'from' store
            if (transfer.status === "in-transit") {
              transfer.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                  updateProductStock(
                    item.productId,
                    product.stock + item.quantity,
                    InventoryHistoryType.TOG_OUT, // Log as a reversal of the original TOG_OUT
                    transfer.id,
                    `Rejected transfer: ${item.quantity}x ${item.productName} returned to ${transfer.transferFromStoreName}`,
                    transfer.transferFromStoreId,
                    actingUser?.id
                  );
                }
              });
            }
            toast.info(`Transfer "${transfer.id.substring(0,8)}" rejected.`);
            return { ...transfer, status: newStatus };
          } else {
            toast.error(`Invalid status transition for Transfer "${transfer.id.substring(0,8)}".`);
          }
        }
        return transfer;
      });
      return updatedTransfers;
    });
  }, [user, products, updateProductStock]);

  const deleteTransfer = useCallback((transferId: string) => {
    // In a real app, deleting an active transfer would require careful stock reconciliation.
    // For this mock, we'll just remove the record.
    setTransfers((prev) => prev.filter((transfer) => transfer.id !== transferId));
    toast.info("Transfer of Goods deleted.");
  }, []);

  const getTransferById = useCallback((transferId: string) => {
    return transfers.find(transfer => transfer.id === transferId);
  }, [transfers]);

  return (
    <TransferOfGoodsContext.Provider value={{ transfers, addTransfer, updateTransferStatus, deleteTransfer, getTransferById }}>
      {children}
    </TransferOfGoodsContext.Provider>
  );
};

export const useTransferOfGoods = () => {
  const context = useContext(TransferOfGoodsContext);
  if (context === undefined) {
    throw new Error("useTransferOfGoods must be used within a TransferOfGoodsProvider");
  }
  return context;
};