import { Product } from "@/types/product";

export const mockProducts: Product[] = [
  { id: "1", name: "Laptop Pro", categoryId: "cat-1", price: 1200.00, stock: 15, sku: "LP-001" },
  { id: "2", name: "Wireless Mouse", categoryId: "cat-2", price: 25.50, stock: 50, sku: "WM-002" },
  { id: "3", name: "Mechanical Keyboard", categoryId: "cat-2", price: 75.00, stock: 30, sku: "MK-003" },
  { id: "4", name: "USB-C Hub", categoryId: "cat-2", price: 40.00, stock: 20, sku: "UH-004" },
  { id: "5", name: "External SSD 1TB", categoryId: "cat-3", price: 150.00, stock: 10, sku: "ES-005" },
  { id: "6", name: "Monitor 27-inch", categoryId: "cat-1", price: 300.00, stock: 10, sku: "MON-006" },
  { id: "7", name: "Webcam HD", categoryId: "cat-2", price: 50.00, stock: 25, sku: "WC-007" },
  { id: "8", name: "Desk Chair Ergonomic", categoryId: "cat-4", price: 250.00, stock: 5, sku: "DCE-008" },
];