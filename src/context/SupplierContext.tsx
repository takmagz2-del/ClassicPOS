"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Supplier } from "@/types/supplier";
import { mockSuppliers } from "@/data/mockSuppliers";
import { toast } from "sonner";

interface SupplierContextType {
  suppliers: Supplier[];
  addSupplier: (newSupplier: Omit<Supplier, "id">) => void;
  updateSupplier: (updatedSupplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const SupplierProvider = ({ children }: { children: ReactNode }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (typeof window !== "undefined") {
      const storedSuppliers = localStorage.getItem("suppliers");
      return storedSuppliers ? JSON.parse(storedSuppliers) : mockSuppliers;
    }
    return mockSuppliers;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("suppliers", JSON.stringify(suppliers));
    }
  }, [suppliers]);

  const addSupplier = useCallback((newSupplierData: Omit<Supplier, "id">) => {
    const newSupplier: Supplier = { ...newSupplierData, id: crypto.randomUUID() };
    setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
    toast.success(`Supplier "${newSupplier.name}" added successfully!`);
  }, []);

  const updateSupplier = useCallback((updatedSupplier: Supplier) => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
    );
    toast.success(`Supplier "${updatedSupplier.name}" updated successfully!`);
  }, []);

  const deleteSupplier = useCallback((supplierId: string) => {
    setSuppliers((prevSuppliers) => prevSuppliers.filter((s) => s.id !== supplierId));
    toast.info("Supplier deleted.");
  }, []);

  return (
    <SupplierContext.Provider value={{ suppliers, addSupplier, updateSupplier, deleteSupplier }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error("useSuppliers must be used within a SupplierProvider");
  }
  return context;
};