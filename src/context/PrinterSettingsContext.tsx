"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { PrinterSettings } from "@/types/printer";

interface PrinterSettingsContextType {
  printerSettings: PrinterSettings;
  updatePrinterSettings: (newSettings: Partial<PrinterSettings>) => void;
}

const defaultPrinterSettings: PrinterSettings = {
  printerName: "Default POS Printer",
  printerType: "thermal",
  connectionType: "usb",
  ipAddress: "",
  port: 9100,
  bluetoothAddress: "",
};

const PrinterSettingsContext = createContext<PrinterSettingsContextType | undefined>(undefined);

export const PrinterSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(() => {
    if (typeof window !== "undefined") {
      const storedSettings = localStorage.getItem("printerSettings");
      return storedSettings ? JSON.parse(storedSettings) : defaultPrinterSettings;
    }
    return defaultPrinterSettings;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("printerSettings", JSON.stringify(printerSettings));
    }
  }, [printerSettings]);

  const updatePrinterSettings = useCallback((newSettings: Partial<PrinterSettings>) => {
    setPrinterSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  }, []);

  return (
    <PrinterSettingsContext.Provider value={{ printerSettings, updatePrinterSettings }}>
      {children}
    </PrinterSettingsContext.Provider>
  );
};

export const usePrinterSettings = () => {
  const context = useContext(PrinterSettingsContext);
  if (context === undefined) {
    throw new Error("usePrinterSettings must be used within a PrinterSettingsProvider");
  }
  return context;
};