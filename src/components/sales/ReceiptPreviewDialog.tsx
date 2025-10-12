"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sale } from "@/types/sale";
import { Customer } from "@/types/customer";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { useReceiptSettings } from "@/context/ReceiptSettingsContext";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { useProducts } from "@/context/ProductContext";
import { sendPrintJobToBackend } from "@/services/printService";
import { usePrinterSettings } from "@/context/PrinterSettingsContext";

interface ReceiptPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
  customer?: Customer;
}

const ReceiptPreviewDialog = ({ isOpen, onClose, sale, customer }: ReceiptPreviewDialogProps) => {
  const { currentCurrency } = useCurrency();
  const { receiptSettings } = useReceiptSettings();
  const { printerSettings } = usePrinterSettings();
  const { products } = useProducts();

  const handlePrint = async () => {
    await sendPrintJobToBackend(sale, customer, receiptSettings, printerSettings);
    onClose();
  };

  // Calculate loyalty points discount amount for display on receipt
  const loyaltyPointsDiscountAmount = sale.loyaltyPointsUsed ? sale.loyaltyPointsUsed / 100 : 0; // Assuming 100 points = 1 unit of currency

  const subtotalAfterAllDiscounts = sale.subtotal - (sale.discountAmount || 0) - loyaltyPointsDiscountAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sale Receipt</DialogTitle>
          <DialogDescription>
            Review the receipt for Sale ID: <span className="font-semibold">{sale.id.substring(0, 8)}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 border rounded-md bg-white dark:bg-gray-900 text-sm">
          <div className="text-center mb-4">
            {receiptSettings.logoUrl && (
              <img src={receiptSettings.logoUrl} alt={`${receiptSettings.storeName} Logo`} className="mx-auto h-16 mb-2" />
            )}
            <h3 className="text-lg font-bold">{receiptSettings.storeName}</h3>
            <p className="text-xs text-muted-foreground">{receiptSettings.storeAddress}</p>
            <p className="text-xs text-muted-foreground">{receiptSettings.storePhone}</p>
            {receiptSettings.storeWebsite && <p className="text-xs text-muted-foreground">{receiptSettings.storeWebsite}</p>}
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between text-xs mb-1">
            <span>Date:</span>
            <span>{format(new Date(sale.date), "MMM dd, yyyy HH:mm")}</span>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span>Sale ID:</span>
            <span>{sale.id.substring(0, 8)}</span>
          </div>

          {receiptSettings.showCustomerInfo && customer && (
            <>
              <Separator className="my-2" />
              <p className="font-semibold text-xs mb-1">Customer Info:</p>
              <div className="flex justify-between text-xs">
                <span>Name:</span>
                <span>{customer.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Email:</span>
                <span>{customer.email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Loyalty Points:</span>
                <span>{customer.loyaltyPoints + (sale.loyaltyPointsUsed || 0) - Math.floor(subtotalAfterAllDiscounts)}</span> {/* Display points after this transaction */}
              </div>
            </>
          )}

          <Separator className="my-2" />

          <p className="font-semibold text-xs mb-1">Items:</p>
          {sale.items.map((item) => {
            const product = products.find(p => p.id === item.productId);
            return (
              <React.Fragment key={item.productId}>
                <div className="grid grid-cols-4 gap-2 text-xs mb-1">
                  <span className="col-span-2">{item.name}</span>
                  <span className="text-center">{item.quantity}x</span>
                  <span className="text-right">{formatCurrency(item.price, currentCurrency)}</span>
                  <span className="text-right font-medium">{formatCurrency(item.price * item.quantity, currentCurrency)}</span>
                </div>
                {receiptSettings.showSku && product?.sku && (
                  <span className="col-span-4 text-muted-foreground text-[0.65rem] ml-2 block">SKU: {product.sku}</span>
                )}
                {receiptSettings.showCategory && product?.category && (
                  <span className="col-span-4 text-muted-foreground text-[0.65rem] ml-2 block">Category: {product.category}</span>
                )}
              </React.Fragment>
            );
          })}

          <Separator className="my-2" />

          <div className="flex justify-between text-xs mb-1">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(sale.subtotal, currentCurrency)}</span>
          </div>
          {sale.discountPercentage && sale.discountAmount && sale.discountPercentage > 0 && (
            <div className="flex justify-between text-xs mb-1 text-red-600 dark:text-red-400">
              <span>Discount ({sale.discountPercentage}%):</span>
              <span className="font-medium">-{formatCurrency(sale.discountAmount, currentCurrency)}</span>
            </div>
          )}
          {loyaltyPointsDiscountAmount > 0 && (
            <div className="flex justify-between text-xs mb-1 text-red-600 dark:text-red-400">
              <span>Loyalty Points Discount:</span>
              <span className="font-medium">-{formatCurrency(loyaltyPointsDiscountAmount, currentCurrency)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs mb-1">
            <span>Tax ({(sale.taxRateApplied !== undefined ? sale.taxRateApplied * 100 : 0).toFixed(2)}%):</span>
            <span className="font-medium">{formatCurrency(sale.tax, currentCurrency)}</span>
          </div>
          {sale.giftCardAmountUsed && sale.giftCardAmountUsed > 0 && (
            <div className="flex justify-between text-xs mb-1 text-green-600 dark:text-green-400">
              <span>Gift Card Applied:</span>
              <span className="font-medium">-{formatCurrency(sale.giftCardAmountUsed, currentCurrency)}</span>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between text-base font-bold mb-4">
            <span>TOTAL:</span>
            <span>{formatCurrency(sale.total, currentCurrency)}</span>
          </div>

          {sale.loyaltyPointsUsed && sale.loyaltyPointsUsed > 0 && (
            <div className="text-center text-xs text-muted-foreground mb-1">
              <p>Redeemed {sale.loyaltyPointsUsed} loyalty points.</p>
            </div>
          )}
          {customer && (
            <div className="text-center text-xs text-muted-foreground mb-1">
              <p>Earned {Math.floor(subtotalAfterAllDiscounts)} loyalty points on this purchase.</p>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            <p>{receiptSettings.thankYouMessage}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Send to Printer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPreviewDialog;