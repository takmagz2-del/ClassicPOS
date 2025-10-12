"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Apple, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodButtonsProps {
  onProcessSale: () => void;
  onApplePay: () => void;
  onGooglePay: () => void;
  onClearCart: () => void;
  onCreditSale: () => void; // New prop for credit sale
  hasItemsInCart: boolean;
  finalTotal: number;
}

const PaymentMethodButtons = ({
  onProcessSale,
  onApplePay,
  onGooglePay,
  onClearCart,
  onCreditSale, // Destructure new prop
  hasItemsInCart,
  finalTotal,
}: PaymentMethodButtonsProps) => {
  const isDisabled = !hasItemsInCart || finalTotal < 0;
  const isCreditSaleDisabled = isDisabled || finalTotal === 0; // Credit sale should not be for 0 total

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onProcessSale} className="w-full" disabled={isDisabled}>
        <CreditCard className="mr-2 h-4 w-4" /> Process Sale (Cash/Card)
      </Button>
      <Button onClick={onApplePay} className={cn("w-full bg-black text-white hover:bg-gray-800", isDisabled && "opacity-50 cursor-not-allowed")} disabled={isDisabled}>
        <Apple className="mr-2 h-4 w-4" /> Pay with Apple Pay
      </Button>
      <Button onClick={onGooglePay} className={cn("w-full bg-blue-600 text-white hover:bg-blue-700", isDisabled && "opacity-50 cursor-not-allowed")} disabled={isDisabled}>
        <CreditCard className="mr-2 h-4 w-4" /> Pay with Google Pay
      </Button>
      <Button onClick={onCreditSale} className={cn("w-full bg-purple-600 text-white hover:bg-purple-700", isCreditSaleDisabled && "opacity-50 cursor-not-allowed")} disabled={isCreditSaleDisabled}>
        <CreditCard className="mr-2 h-4 w-4" /> Credit Sale
      </Button>
      <Button onClick={onClearCart} variant="outline" className="w-full" disabled={!hasItemsInCart}>
        Clear Cart
      </Button>
    </div>
  );
};

export default PaymentMethodButtons;