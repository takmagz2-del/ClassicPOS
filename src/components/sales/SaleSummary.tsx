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
}

const SaleSummary = ({ subtotal, taxRate, onCheckout, onClearCart, hasItemsInCart }: SaleSummaryProps) => {
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

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
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={onCheckout} className="w-full" disabled={!hasItemsInCart}>
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