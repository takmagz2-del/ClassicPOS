"use client";

import React, { useState } from "react";
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
import { SaleItem } from "@/types/sale";
import { Customer } from "@/types/customer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext"; // Import useCurrency
import { formatCurrency } from "@/lib/utils"; // Import formatCurrency

interface SaleConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSale: (paymentMethod: string, cashReceived?: number) => void;
  saleDetails: {
    items: SaleItem[];
    subtotal: number;
    tax: number;
    total: number;
    giftCardAmountUsed: number;
    customer?: Customer;
    discountPercentage?: number;
    discountAmount?: number;
    taxRateApplied?: number; // New: The tax rate applied to this sale
  };
  paymentMethod: string;
}

const SaleConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirmSale,
  saleDetails,
  paymentMethod,
}: SaleConfirmationDialogProps) => {
  const { items, subtotal, tax, total, giftCardAmountUsed, customer, discountPercentage, discountAmount, taxRateApplied } = saleDetails;
  const [cashReceived, setCashReceived] = useState<string>("");
  const { currentCurrency } = useCurrency(); // Use currentCurrency from context

  const isCashPayment = paymentMethod === "Cash/Card";
  const parsedCashReceived = parseFloat(cashReceived);
  const changeDue = isCashPayment && !isNaN(parsedCashReceived) ? parsedCashReceived - total : 0;

  const handleConfirm = () => {
    if (isCashPayment && (isNaN(parsedCashReceived) || parsedCashReceived < total)) {
      toast.error(`Cash received must be equal to or greater than the total amount (${formatCurrency(total, currentCurrency)}).`);
      return;
    }
    onConfirmSale(paymentMethod, isCashPayment ? parsedCashReceived : undefined);
  };

  const subtotalAfterDiscount = subtotal - (discountAmount || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Sale</DialogTitle>
          <DialogDescription>Review the sale details before finalizing the transaction.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {customer && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Customer:</span>
              <span>{customer.name} ({customer.email})</span>
            </div>
          )}
          <div className="space-y-2">
            <h4 className="font-semibold">Items:</h4>
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm text-muted-foreground">
                <span>{item.quantity}x {item.name}</span>
                <span>{formatCurrency(item.price * item.quantity, currentCurrency)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal, currentCurrency)}</span>
          </div>
          {discountPercentage && discountAmount && discountPercentage > 0 && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>Discount ({discountPercentage}%):</span>
              <span className="font-medium">-{formatCurrency(discountAmount, currentCurrency)}</span>
            </div>
          )}
          {discountPercentage && discountPercentage > 0 && (
            <div className="flex justify-between">
              <span>Subtotal (after discount):</span>
              <span className="font-medium">{formatCurrency(subtotalAfterDiscount, currentCurrency)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax ({(taxRateApplied !== undefined ? taxRateApplied * 100 : 0).toFixed(2)}%):</span> {/* Display dynamic tax rate */}
            <span className="font-medium">{formatCurrency(tax, currentCurrency)}</span>
          </div>
          {giftCardAmountUsed > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Gift Card Applied:</span>
              <span className="font-medium">-{formatCurrency(giftCardAmountUsed, currentCurrency)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(total, currentCurrency)}</span>
          </div>

          {isCashPayment && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="cash-received">Cash Received</Label>
              <Input
                id="cash-received"
                type="number"
                step="0.01"
                placeholder={`Enter amount (min ${formatCurrency(total, currentCurrency)})`}
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                min={total}
              />
              {changeDue > 0 && (
                <p className="text-sm text-muted-foreground">Change Due: <span className="font-medium">{formatCurrency(changeDue, currentCurrency)}</span></p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm {paymentMethod}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaleConfirmationDialog;