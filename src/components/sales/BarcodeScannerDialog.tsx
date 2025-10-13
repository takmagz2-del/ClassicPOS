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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
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
      }

      const html5QrcodeScanner = scannerRef.current;

      const handleScanSuccess = (decodedText: string) => {
        onScanSuccess(decodedText);
        toast.success(`Scanned: ${decodedText}`);
        onClose(); // Close dialog after successful scan
      };

      const handleScanError = (errorMessage: string) => {
        // console.warn(`Barcode scan error: ${errorMessage}`);
        // Optionally show a toast for persistent errors, but avoid spamming
      };

      html5QrcodeScanner.render(handleScanSuccess, handleScanError);

      return () => {
        if (html5QrcodeScanner.is
          Scanning) {
          html5QrcodeScanner.stop().catch((err) => {
            console.error("Failed to stop html5QrcodeScanner", err);
          });
        }
      };
    } else {
      // If dialog is closed, ensure scanner is stopped
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) => {
          console.error("Failed to stop html5QrcodeScanner on close", err);
        });
      }
    }
  }, [isOpen, onScanSuccess, onClose]);

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