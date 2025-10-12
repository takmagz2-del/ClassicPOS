"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Customer } from "@/types/customer";
import { mockCustomers } from "@/data/mockCustomers";

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (newCustomer: Customer) => void;
  updateCustomer: (updatedCustomer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const addCustomer = useCallback((newCustomer: Customer) => {
    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
  }, []);

  const updateCustomer = useCallback((updatedCustomer: Customer) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
  }, []);

  const deleteCustomer = useCallback((customerId: string) => {
    setCustomers((prevCustomers) => prevCustomers.filter((c) => c.id !== customerId));
  }, []);

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return context;
};