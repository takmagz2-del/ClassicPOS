export interface Product {
  id: string;
  name: string;
  categoryId: string; // Changed from 'category: string' to 'categoryId: string'
  price: number;
  stock: number;
  sku: string;
}