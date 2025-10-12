export interface Product {
  id: string;
  name: string;
  categoryId: string; // Changed from 'category: string' to 'categoryId: string'
  price: number;
  cost: number; // New: The cost of the product
  stock: number;
  sku: string;
  imageUrl?: string; // New: Optional image URL for the product
}