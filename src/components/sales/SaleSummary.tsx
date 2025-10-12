"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SaleSummaryProps {
  subtotal: number;
  taxRate: number;
  giftCardAmountUsed: number;
}

const SaleSummary = ({ subtotal, taxRate, giftCardAmountUsed }: SaleSummaryProps) => {
  const tax = subtotal * taxRate;
  let total = subtotal + tax;

  // Apply gift card discount
  const finalTotal = Math.max(0, total - giftCardAmountUsed);
  const giftCardDisplayAmount = Math.min(giftCardAmountUsed, total); // Show only up to the total amount

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