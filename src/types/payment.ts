export interface PaymentMethod {
  id: string;
  name: string;
  isCashEquivalent: boolean; // e.g., Cash, Card, Apple Pay, Google Pay
  isCredit: boolean; // e.g., Credit Account
  isBNPL: boolean; // e.g., Afterpay, Klarna
}

export const defaultPaymentMethods: PaymentMethod[] = [
  { id: "pm-cash-card", name: "Cash/Card", isCashEquivalent: true, isCredit: false, isBNPL: false },
  { id: "pm-apple-pay", name: "Apple Pay", isCashEquivalent: true, isCredit: false, isBNPL: false },
  { id: "pm-google-pay", name: "Google Pay", isCashEquivalent: true, isCredit: false, isBNPL: false },
  { id: "pm-credit-account", name: "Credit Account", isCashEquivalent: false, isCredit: true, isBNPL: false },
  { id: "pm-afterpay", name: "Afterpay", isCashEquivalent: false, isCredit: false, isBNPL: true },
  { id: "pm-klarna", name: "Klarna", isCashEquivalent: false, isCredit: false, isBNPL: true },
];