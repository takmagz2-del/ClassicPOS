"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Apple, CreditCard, Chrome } from "lucide-react"; // Changed Google to Chrome
import { cn } from "@/lib/utils";

interface PaymentMethodButtonsProps {
  onProcessSale: () => void;
  onApplePay: () => void;
  onGooglePay: () => void;
  onClearCart: () => void;
  hasItemsInCart: boolean;
  finalTotal: number;
}

const PaymentMethodButtons = ({
  onProcessSale,
  onApplePay,
  onGooglePay,
  onClearCart,
  hasItemsInCart,
  finalTotal,
}: PaymentMethodButtonsProps) => {
  const isDisabled = !hasItemsInCart || finalTotal < 0;

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onProcessSale} className="w-full" disabled={isDisabled}>
        <CreditCard className="mr-2 h-4 w-4" /> Process Sale (Cash/Card)
      </Button>
      <Button onClick={onApplePay} className={cn("w-full bg-black text-white hover:bg-gray-800", isDisabled && "opacity-50 cursor-not-allowed")} disabled={isDisabled}>
        <Apple className="mr-2 h-4 w-4" /> Pay with Apple Pay
      </Button>
      <Button onClick={onGooglePay} className={cn("w-full bg-blue-600 text-white hover:bg-blue-700", isDisabled && "opacity-50 cursor-not-allowed")} disabled={isDisabled}>
        <Chrome className="mr-2 h-4 w-4" /> Pay with Google Pay {/* Changed Google to Chrome */}
      </Button>
      <Button onClick={onClearCart} variant="outline" className="w-full" disabled={!hasItemsInCart}>
        Clear Cart
      </Button>
    </div>
  );
};

export default PaymentMethodButtons;