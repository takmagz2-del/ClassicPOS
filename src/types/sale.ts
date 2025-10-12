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
}