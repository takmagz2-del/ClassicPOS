"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { PaymentMethod } from "@/types/payment";
import { mockPaymentMethods } from "@/data/mockPaymentMethods"; // Updated import
import { toast } from "sonner";

interface PaymentMethodContextType {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (newMethod: Omit<PaymentMethod, "id">) => void;
  updatePaymentMethod: (updatedMethod: PaymentMethod) => void;
  deletePaymentMethod: (id: string) => void;
  getPaymentMethodName: (id: string) => string;
}

const PaymentMethodContext = createContext<PaymentMethodContextType | undefined>(undefined);

export const PaymentMethodProvider = ({ children }: { children: ReactNode }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    if (typeof window !== "undefined") {
      const storedMethods = localStorage.getItem("paymentMethods");
      return storedMethods ? JSON.parse(storedMethods) : mockPaymentMethods; // Use mockPaymentMethods as initial
    }
    return mockPaymentMethods;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));
    }
  }, [paymentMethods]);

  const addPaymentMethod = useCallback((newMethod: Omit<PaymentMethod, "id">) => {
    if (paymentMethods.some(pm => pm.name.toLowerCase() === newMethod.name.toLowerCase())) {
      toast.error(`Payment method "${newMethod.name}" already exists.`);
      return;
    }
    const methodWithId: PaymentMethod = { ...newMethod, id: crypto.randomUUID() };
    setPaymentMethods((prevMethods) => [...prevMethods, methodWithId]);
    toast.success(`Payment method "${newMethod.name}" added.`);
  }, [paymentMethods]);

  const updatePaymentMethod = useCallback((updatedMethod: PaymentMethod) => {
    if (paymentMethods.some(pm => pm.id !== updatedMethod.id && pm.name.toLowerCase() === updatedMethod.name.toLowerCase())) {
      toast.error(`Payment method "${updatedMethod.name}" already exists.`);
      return;
    }
    setPaymentMethods((prevMethods) =>
      prevMethods.map((pm) => (pm.id === updatedMethod.id ? updatedMethod : pm))
    );
    toast.success(`Payment method "${updatedMethod.name}" updated.`);
  }, [paymentMethods]);

  const deletePaymentMethod = useCallback((id: string) => {
    const methodToDelete = paymentMethods.find(pm => pm.id === id);
    if (!methodToDelete) return; // Should not happen if UI is correct

    setPaymentMethods((prevMethods) => prevMethods.filter((pm) => pm.id !== id));
    toast.info(`Payment method "${methodToDelete.name}" deleted.`);
  }, [paymentMethods]);

  const getPaymentMethodName = useCallback((id: string) => {
    return paymentMethods.find(pm => pm.id === id)?.name || "Unknown";
  }, [paymentMethods]);

  return (
    <PaymentMethodContext.Provider value={{ paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, getPaymentMethodName }}>
      {children}
    </PaymentMethodContext.Provider>
  );
};

export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodContext);
  if (context === undefined) {
    throw new Error("usePaymentMethods must be used within a PaymentMethodProvider");
  }
  return context;
};