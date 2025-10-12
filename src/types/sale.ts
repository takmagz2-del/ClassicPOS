export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  date: string; // ISO date string
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "completed" | "cancelled";
  giftCardAmountUsed?: number; // Added for gift card functionality
  customerId?: string; // New: Optional customer ID
  customerName?: string; // New: Optional customer name
  discountPercentage?: number; // New: Optional discount percentage applied
  discountAmount?: number; // New: Optional calculated discount amount
}