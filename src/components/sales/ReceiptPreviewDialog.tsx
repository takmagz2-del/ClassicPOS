"use client";

import React, { useRef } from "react";
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
import { useProducts } from "@/context/ProductContext"; // Import useProducts

interface ReceiptPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
  customer?: Customer;
}

const ReceiptPreviewDialog = ({ isOpen, onClose, sale, customer }: ReceiptPreviewDialogProps) => {
  const { currentCurrency } = useCurrency();
  const { receiptSettings } = useReceiptSettings();
  const { products } = useProducts(); // Use products context
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt #${sale.id.substring(0, 8)}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
              .receipt-container { max-width: 300px; margin: 0 auto; padding: 15px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              .header, .footer { text-align: center; margin-bottom: 15px; }
              .header img { max-width: 100px; margin-bottom: 10px; }
              .header h2 { margin: 0; font-size: 1.5em; }
              .header p { margin: 2px 0; font-size: 0.9em; color: #555; }
              .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; border-bottom: 1px dashed #ccc; padding-bottom: 5px; }
              .item-row { display: flex; justify-content: space-between; font-size: 0.9em; margin-bottom: 3px; }
              .item-row .name { flex: 1; }
              .item-row .qty { width: 30px; text-align: center; }
              .item-row .price { width: 60px; text-align: right; }
              .item-row .total { width: 70px; text-align: right; font-weight: bold; }
              .summary-row { display: flex; justify-content: space-between; font-size: 0.9em; margin-top: 5px; }
              .summary-row.total { font-size: 1.1em; font-weight: bold; margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 10px; }
              .separator { border-top: 1px dashed #ccc; margin: 15px 0; }
              @media print {
                body { margin: 0; }
                .receipt-container { border: none; box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                ${receiptSettings.logoUrl ? `<img src="${receiptSettings.logoUrl}" alt="${receiptSettings.storeName} Logo" />` : ""}
                <h2>${receiptSettings.storeName}</h2>
                <p>${receiptSettings.storeAddress}</p>
                <p>${receiptSettings.storePhone}</p>
                ${receiptSettings.storeWebsite ? `<p>${receiptSettings.storeWebsite}</p>` : ""}
              </div>

              <div class="separator"></div>

              <p><strong>Date:</strong> ${format(new Date(sale.date), "MMM dd, yyyy HH:mm")}</p>
              <p><strong>Sale ID:</strong> ${sale.id.substring(0, 8)}</p>

              ${receiptSettings.showCustomerInfo && customer ? `
                <div class="section-title">Customer Info</div>
                <p><strong>Name:</strong> ${customer.name}</p>
                <p><strong>Email:</strong> ${customer.email}</p>
              ` : ""}

              <div class="section-title">Items</div>
              <div class="item-row">
                <span class="name">Item</span>
                <span class="qty">Qty</span>
                <span class="price">Price</span>
                <span class="total">Total</span>
              </div>
              <div class="separator"></div>
              ${sale.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return `
                <div class="item-row">
                  <span class="name">${item.name}</span>
                  <span class="qty">${item.quantity}</span>
                  <span class="price">${formatCurrency(item.price, currentCurrency)}</span>
                  <span class="total">${formatCurrency(item.price * item.quantity, currentCurrency)}</span>
                </div>
                ${receiptSettings.showSku && product?.sku ? `<div class="item-row" style="font-size: 0.7em; color: #777; margin-left: 10px;">SKU: ${product.sku}</div>` : ""}
                ${receiptSettings.showCategory && product?.category ? `<div class="item-row" style="font-size: 0.7em; color: #777; margin-left: 10px;">Category: ${product.category}</div>` : ""}
              `;
              }).join("")}
              <div class="separator"></div>

              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(sale.subtotal, currentCurrency)}</span>
              </div>
              ${sale.discountPercentage && sale.discountAmount && sale.discountPercentage > 0 ? `
                <div class="summary-row" style="color: red;">
                  <span>Discount (${sale.discountPercentage}%):</span>
                  <span>-${formatCurrency(sale.discountAmount, currentCurrency)}</span>
                </div>
              ` : ""}
              <div class="summary-row">
                <span>Tax (${(sale.tax / (sale.subtotal - (sale.discountAmount || 0)) * 100).toFixed(2)}%):</span>
                <span>${formatCurrency(sale.tax, currentCurrency)}</span>
              </div>
              ${sale.giftCardAmountUsed && sale.giftCardAmountUsed > 0 ? `
                <div class="summary-row" style="color: green;">
                  <span>Gift Card:</span>
                  <span>-${formatCurrency(sale.giftCardAmountUsed, currentCurrency)}</span>
                </div>
              ` : ""}
              <div class="summary-row total">
                <span>TOTAL:</span>
                <span>${formatCurrency(sale.total, currentCurrency)}</span>
              </div>

              <div class="separator"></div>

              <div class="footer">
                <p>${receiptSettings.thankYouMessage}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sale Receipt</DialogTitle>
          <DialogDescription>
            Review the receipt for Sale ID: <span className="font-semibold">{sale.id.substring(0, 8)}</span>
          </DialogDescription>
        </DialogHeader>
        <div ref={receiptRef} className="p-4 border rounded-md bg-white dark:bg-gray-900 text-sm">
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
          <div className="flex justify-between text-xs mb-1">
            <span>Tax:</span>
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

          <div className="text-center text-xs text-muted-foreground">
            <p>{receiptSettings.thankYouMessage}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPreviewDialog;