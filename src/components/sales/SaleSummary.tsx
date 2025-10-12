"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SaleSummaryProps {
  subtotal: number;
  taxRate: number;
  giftCardAmountUsed: number;
  discountPercentage: number; // New prop
  discountAmount: number; // New prop
}

const SaleSummary = ({ subtotal, taxRate, giftCardAmountUsed, discountPercentage, discountAmount }: SaleSummaryProps) => {
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * taxRate;
  let totalBeforeGiftCard = subtotalAfterDiscount + tax;

  const finalTotal = Math.max(0, totalBeforeGiftCard - giftCardAmountUsed);
  const giftCardDisplayAmount = Math.min(giftCardAmountUsed, totalBeforeGiftCard);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        {discountPercentage > 0 && (
          <div className="flex justify-between text-red-600 dark:text-red-400">
            <span>Discount ({discountPercentage}%):</span>
            <span className="font-medium">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Subtotal (after discount):</span>
          <span className="font-medium">${subtotalAfterDiscount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({taxRate * 100}%):</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        {giftCardAmountUsed > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Gift Card Applied:</span>
            <span className="font-medium">-${giftCardDisplayAmount.toFixed(2)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleSummary;