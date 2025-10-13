export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  cost: number;
  wholesalePrice: number; // New: Wholesale price of the product
  stock: number;
  trackStock: boolean; // New: Whether to track stock for this product
  availableForSale: boolean; // New: Whether the product is available for sale
  sku: string;
  imageUrl?: string;
}