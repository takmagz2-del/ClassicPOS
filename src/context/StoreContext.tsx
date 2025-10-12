"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Store } from "@/types/store";
import { mockStores } from "@/data/mockStores";
import { toast } from "sonner";

interface StoreContextType {
  stores: Store[];
  addStore: (newStore: Omit<Store, "id">) => void;
  updateStore: (updatedStore: Store) => void;
  deleteStore: (storeId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [stores, setStores] = useState<Store[]>(mockStores);

  const addStore = useCallback((newStoreData: Omit<Store, "id">) => {
    const newStore: Store = { ...newStoreData, id: crypto.randomUUID() };
    setStores((prevStores) => [...prevStores, newStore]);
    toast.success(`Store "${newStore.name}" added successfully!`);
  }, []);

  const updateStore = useCallback((updatedStore: Store) => {
    setStores((prevStores) =>
      prevStores.map((s) => (s.id === updatedStore.id ? updatedStore : s))
    );
    toast.success(`Store "${updatedStore.name}" updated successfully!`);
  }, []);

  const deleteStore = useCallback((storeId: string) => {
    // In a real app, you'd check if the store has associated sales/inventory
    // before allowing deletion. For now, we'll just delete it.
    setStores((prevStores) => prevStores.filter((s) => s.id !== storeId));
    toast.info("Store deleted.");
  }, []);

  return (
    <StoreContext.Provider value={{ stores, addStore, updateStore, deleteStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStores = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStores must be used within a StoreProvider");
  }
  return context;
};