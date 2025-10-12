"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { TaxRate } from "@/types/tax";
import { toast } from "sonner";

interface TaxContextType {
  taxRates: TaxRate[];
  defaultTaxRate: TaxRate;
  addTaxRate: (newRate: Omit<TaxRate, "id">) => void;
  updateTaxRate: (updatedRate: TaxRate) => void;
  deleteTaxRate: (id: string) => void;
  setDefaultTaxRate: (id: string) => void;
}

const defaultTaxRates: TaxRate[] = [
  { id: "tax-1", name: "Standard Tax", rate: 0.08, isDefault: true }, // 8%
  { id: "tax-2", name: "Reduced Tax", rate: 0.05, isDefault: false }, // 5%
];

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export const TaxProvider = ({ children }: { children: ReactNode }) => {
  const [taxRates, setTaxRates] = useState<TaxRate[]>(() => {
    if (typeof window !== "undefined") {
      const storedRates = localStorage.getItem("taxRates");
      return storedRates ? JSON.parse(storedRates) : defaultTaxRates;
    }
    return defaultTaxRates;
  });

  const [defaultTaxRate, setDefaultTaxRateState] = useState<TaxRate>(() => {
    if (typeof window !== "undefined") {
      const storedRates = localStorage.getItem("taxRates");
      const rates = storedRates ? JSON.parse(storedRates) : defaultTaxRates;
      return rates.find((rate: TaxRate) => rate.isDefault) || defaultTaxRates[0];
    }
    return defaultTaxRates[0];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("taxRates", JSON.stringify(taxRates));
      const currentDefault = taxRates.find(rate => rate.isDefault);
      if (currentDefault) {
        setDefaultTaxRateState(currentDefault);
      } else if (taxRates.length > 0) {
        // If no default is set, make the first one default
        const updatedRates = taxRates.map((rate, index) => ({
          ...rate,
          isDefault: index === 0,
        }));
        setTaxRates(updatedRates);
        setDefaultTaxRateState(updatedRates[0]);
      } else {
        // If no tax rates exist, set a placeholder default
        setDefaultTaxRateState({ id: "no-tax", name: "No Tax", rate: 0, isDefault: true });
      }
    }
  }, [taxRates]);

  const addTaxRate = useCallback((newRate: Omit<TaxRate, "id">) => {
    const rateWithId: TaxRate = { ...newRate, id: crypto.randomUUID() };
    setTaxRates((prevRates) => {
      const updatedRates = [...prevRates, rateWithId];
      if (rateWithId.isDefault) {
        return updatedRates.map(r => r.id === rateWithId.id ? r : { ...r, isDefault: false });
      }
      return updatedRates;
    });
    toast.success(`Tax rate "${newRate.name}" added.`);
  }, []);

  const updateTaxRate = useCallback((updatedRate: TaxRate) => {
    setTaxRates((prevRates) => {
      const updatedList = prevRates.map((rate) =>
        rate.id === updatedRate.id ? updatedRate : rate
      );
      if (updatedRate.isDefault) {
        return updatedList.map(r => r.id === updatedRate.id ? r : { ...r, isDefault: false });
      }
      return updatedList;
    });
    toast.success(`Tax rate "${updatedRate.name}" updated.`);
  }, []);

  const deleteTaxRate = useCallback((id: string) => {
    setTaxRates((prevRates) => {
      const filteredRates = prevRates.filter((rate) => rate.id !== id);
      if (filteredRates.length === 0) {
        toast.info("All tax rates deleted. Defaulting to 0% tax.");
        return [];
      }
      // If the deleted rate was the default, set a new default
      if (prevRates.find(rate => rate.id === id)?.isDefault) {
        const newDefaultRates = filteredRates.map((rate, index) => ({
          ...rate,
          isDefault: index === 0,
        }));
        return newDefaultRates;
      }
      return filteredRates;
    });
    toast.info("Tax rate deleted.");
  }, []);

  const handleSetDefaultTaxRate = useCallback((id: string) => {
    setTaxRates((prevRates) =>
      prevRates.map((rate) => ({
        ...rate,
        isDefault: rate.id === id,
      }))
    );
    toast.success("Default tax rate updated.");
  }, []);

  return (
    <TaxContext.Provider value={{ taxRates, defaultTaxRate, addTaxRate, updateTaxRate, deleteTaxRate, setDefaultTaxRate: handleSetDefaultTaxRate }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = () => {
  const context = useContext(TaxContext);
  if (context === undefined) {
    throw new Error("useTax must be used within a TaxProvider");
  }
  return context;
};