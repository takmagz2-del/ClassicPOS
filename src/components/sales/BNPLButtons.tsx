"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";

interface BNPLButtonsProps {
  onAfterpay: () => void;
  onKlarna: () => void;
  hasItemsInCart: boolean;
  finalTotal: number;
}

const BNPLButtons = ({
  onAfterpay,
  onKlarna,
  hasItemsInCart,
  finalTotal,
}: BNPLButtonsProps) => {
  const isDisabled = !hasItemsInCart || finalTotal < 0;

  return (
    <div className="flex flex-col gap-2 border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-2">Buy Now, Pay Later</h3>
      <Button onClick={onAfterpay} className={cn("w-full bg-green-500 text-white hover:bg-green-600", isDisabled && "opacity-50 cursor-not-allowed")} disabled={isDisabled}>
        <CreditCard className="mr-2 h-4 w-4" /> Pay with Afterpay
      </Button>
      <Button onClick={onKlarna} className={cn("w-full bg-pink-400 text-white hover:bg-pink-500", isDisabled && "opacity-50 cursor-not-allowed")} disabled={isDisabled}>
        <CreditCard className="mr-2 h-4 w-4" /> Pay with Klarna
      </Button>
    </div>
  );
};

export default BNPLButtons;