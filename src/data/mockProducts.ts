import { Product } from "@/types/product";

export const mockProducts: Product[] = [
  { id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", name: "Laptop Pro", categoryId: "cat-1", price: 1200.00, stock: 15, sku: "LP-001" },
  { id: "b2c3d4e5-f6a7-8901-2345-67890abcdef0", name: "Wireless Mouse", categoryId: "cat-2", price: 25.50, stock: 50, sku: "WM-002" },
  { id: "c3d4e5f6-a7b8-9012-3456-7890abcdef01", name: "Mechanical Keyboard", categoryId: "cat-2", price: 75.00, stock: 30, sku: "MK-003" },
  { id: "d4e5f6a7-b8c9-0123-4567-890abcdef012", name: "USB-C Hub", categoryId: "cat-2", price: 40.00, stock: 20, sku: "UH-004" },
  { id: "e5f6a7b8-c9d0-1234-5678-90abcdef0123", name: "External SSD 1TB", categoryId: "cat-3", price: 150.00, stock: 10, sku: "ES-005" },
  { id: "f6a7b8c9-d0e1-2345-6789-0abcdef01234", name: "Monitor 27-inch", categoryId: "cat-1", price: 300.00, stock: 10, sku: "MON-006" },
  { id: "a7b8c9d0-e1f2-3456-7890-abcdef012345", name: "Webcam HD", categoryId: "cat-2", price: 50.00, stock: 25, sku: "WC-007" },
  { id: "b8c9d0e1-f2a3-4567-8901-234567890abc", name: "Desk Chair Ergonomic", categoryId: "cat-4", price: 250.00, stock: 5, sku: "DCE-008" },
];