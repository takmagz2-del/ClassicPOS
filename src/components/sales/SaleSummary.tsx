"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/context/CurrencyContext"; // Import useCurrency
import { formatCurrency } from "@/lib/utils"; // Import formatCurrency

interface SaleSummaryProps {
  subtotal: number;
  taxRate: number; // Now passed as a prop from Sales page
  giftCardAmountUsed: number;
  discountPercentage: number;
  discountAmount: number;
}

const SaleSummary = ({ subtotal, taxRate, giftCardAmountUsed, discountPercentage, discountAmount }: SaleSummaryProps) => {
  const { currentCurrency } = useCurrency(); // Use currentCurrency from context

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
          <span className="font-medium">{formatCurrency(subtotal, currentCurrency)}</span>
        </div>
        {discountPercentage > 0 && (
          <div className="flex justify-between text-red-600 dark:text-red-400">
            <span>Discount ({discountPercentage}%):</span>
            <span className="font-medium">-{formatCurrency(discountAmount, currentCurrency)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Subtotal (after discount):</span>
          <span className="font-medium">{formatCurrency(subtotalAfterDiscount, currentCurrency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({(taxRate * 100).toFixed(2)}%):</span> {/* Display dynamic tax rate */}
          <span className="font-medium">{formatCurrency(tax, currentCurrency)}</span>
        </div>
        {giftCardAmountUsed > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Gift Card Applied:</span>
            <span className="font-medium">-{formatCurrency(giftCardDisplayAmount, currentCurrency)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>{formatCurrency(finalTotal, currentCurrency)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleSummary;