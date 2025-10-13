"use client";

import { PaymentMethod } from "@/types/payment";

export const mockPaymentMethods: PaymentMethod[] = [
  { id: "pm-cash-card", name: "Cash/Card", isCashEquivalent: true, isCredit: false, isBNPL: false },
  { id: "pm-zig-wallet", name: "ZiG Digital Wallet", isCashEquivalent: true, isCredit: false, isBNPL: false },
  { id: "pm-apple-pay", name: "Apple Pay", isCashEquivalent: true, isCredit: false, isBNPL: false },
  { id: "pm-google-pay", name: "Google Pay", isCashEquivalent: true, isCredit: false, isBNPL: false },
  { id: "pm-credit-account", name: "Credit Account", isCashEquivalent: false, isCredit: true, isBNPL: false },
  { id: "pm-afterpay", name: "Afterpay", isCashEquivalent: false, isCredit: false, isBNPL: true },
  { id: "pm-klarna", name: "Klarna", isCashEquivalent: false, isCredit: false, isBNPL: true },
];