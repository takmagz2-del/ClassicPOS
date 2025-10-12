"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SaleSummaryProps {
  subtotal: number;
  taxRate: number;
  onCheckout: () => void;
  onClearCart: () => void;
  hasItemsInCart: boolean;
  giftCardAmountUsed: number; // New prop for gift card amount
}

const SaleSummary = ({ subtotal, taxRate, onCheckout, onClearCart, hasItemsInCart, giftCardAmountUsed }: SaleSummaryProps) => {
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
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={onCheckout} className="w-full" disabled={!hasItemsInCart || finalTotal < 0}>
          Process Sale
        </Button>
        <Button onClick={onClearCart} variant="outline" className="w-full" disabled={!hasItemsInCart}>
          Clear Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SaleSummary;