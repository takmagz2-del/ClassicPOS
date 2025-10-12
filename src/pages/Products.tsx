"use client";

import React from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/products/ProductTable";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockProducts: Product[] = [
  { id: "1", name: "Laptop Pro", category: "Electronics", price: 1200.00, stock: 15, sku: "LP-001" },
  { id: "2", name: "Wireless Mouse", category: "Accessories", price: 25.50, stock: 50, sku: "WM-002" },
  { id: "3", name: "Mechanical Keyboard", category: "Accessories", price: 75.00, stock: 30, sku: "MK-003" },
  { id: "4", name: "USB-C Hub", category: "Accessories", price: 40.00, stock: 20, sku: "UH-004" },
  { id: "5", name: "External SSD 1TB", category: "Storage", price: 150.00, stock: 10, sku: "ES-005" },
];

const Products = () => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={logout} variant="destructive">
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductTable products={mockProducts} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;