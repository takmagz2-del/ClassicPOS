"use client";

import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { toast } from "sonner";

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const qrcodeRegionId = "html5qr-code-full-region";

const BarcodeScannerDialog = ({ isOpen, onClose, onScanSuccess }: BarcodeScannerDialogProps) => {
  const html5QrcodeScannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Get the current scanner instance from the ref
    let scanner = html5QrcodeScannerRef.current;

    if (isOpen) {
      // Initialize scanner if it hasn't been initialized yet
      if (!scanner) {
        scanner = new Html5QrcodeScanner(
          qrcodeRegionId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            disableFlip: false,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.QR_CODE,
            ],
          },
          false // verbose
        );
        html5QrcodeScannerRef.current = scanner; // Store the new instance in the ref
      }

      const handleScanSuccess = (decodedText: string) => {
        onScanSuccess(decodedText);
        toast.success(`Scanned: ${decodedText}`);
        onClose(); // Close dialog after successful scan
      };

      const handleScanError = (errorMessage: string) => {
        // console.warn(`Barcode scan error: ${errorMessage}`);
        // Optionally show a toast for persistent errors, but avoid spamming
      };

      // Only render if the scanner is not already scanning
      if (scanner && !scanner.isScanning) {
        scanner.render(handleScanSuccess, handleScanError);
      }
    }

    // Cleanup function for when the dialog closes or component unmounts
    return () => {
      const currentScanner = html5QrcodeScannerRef.current;
      if (currentScanner && currentScanner.isScanning) {
        currentScanner.stop().catch((err) => {
          console.error("Failed to stop html5QrcodeScanner", err);
        });
        // If the dialog is closing (isOpen becomes false), clear the ref
        // This ensures a fresh scanner instance if the dialog is opened again
        if (!isOpen) {
          html5QrcodeScannerRef.current = null;
        }
      }
    };
  }, [isOpen, onScanSuccess, onClose]); // Dependencies are correct

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Position the barcode within the scanning area.
          </DialogDescription>
        </DialogHeader>
        <div id={qrcodeRegionId} className="w-full h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
          {/* The scanner will render here */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScannerDialog;