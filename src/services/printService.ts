"use client";

import { Sale } from "@/types/sale";
import { Customer } from "@/types/customer";
import { ReceiptSettings } from "@/types/receipt";
import { PrinterSettings } from "@/types/printer"; // New import
import { toast } from "sonner";

/**
 * Simulates sending a print job to a backend service.
 * In a real application, this would make an HTTP request to your backend.
 * The backend would then process the data and send it to a physical printer.
 */
export const sendPrintJobToBackend = async (
  sale: Sale,
  customer: Customer | undefined,
  receiptSettings: ReceiptSettings,
  printerSettings: PrinterSettings, // New parameter
) => {
  console.log("Simulating sending print job to backend...");
  console.log("Sale Data:", sale);
  console.log("Customer Data:", customer);
  console.log("Receipt Settings:", receiptSettings);
  console.log("Printer Settings:", printerSettings); // Log printer settings

  // Simulate network request delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real scenario, you would replace this with an actual fetch/axios call:
  // try {
  //   const response = await fetch('/api/print-receipt', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ sale, customer, receiptSettings, printerSettings }), // Include printerSettings
  //   });
  //
  //   if (!response.ok) {
  //     throw new new Error(`Backend print service error: ${response.statusText}`);
  //   }
  //
  //   const result = await response.json();
  //   console.log("Backend print response:", result);
  //   toast.success("Print job sent to backend successfully!");
  //   return true;
  // } catch (error) {
  //   console.error("Failed to send print job to backend:", error);
  //   toast.error("Failed to send print job. Please check printer connection.");
  //   return false;
  // }

  toast.success("Print job simulated and sent to backend!");
  return true;
};