"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/products/ProductTable";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProductForm from "@/components/products/ProductForm";
import EditProductForm from "@/components/products/EditProductForm";
import DeleteProductDialog from "@/components/products/DeleteProductDialog"; // Import the new DeleteProductDialog
import { PlusCircle } from "lucide-react";
import { toast } from "sonner"; // Ensure toast is imported for success messages

const initialMockProducts: Product[] = [
  { id: "1", name: "Laptop Pro", category: "Electronics", price: 1200.00, stock: 15, sku: "LP-001" },
  { id: "2", name: "Wireless Mouse", category: "Accessories", price: 25.50, stock: 50, sku: "WM-002" },
  { id: "3", name: "Mechanical Keyboard", category: "Accessories", price: 75.00, stock: 30, sku: "MK-003" },
  { id: "4", name: "USB-C Hub", category: "Accessories", price: 40.00, stock: 20, sku: "UH-004" },
  { id: "5", name: "External SSD 1TB", category: "Storage", price: 150.00, stock: 10, sku: "ES-005" },
];

const Products = () => {
  const { logout } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialMockProducts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null); // State for product to delete

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = (productId: string) => {
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
    toast.success("Product deleted successfully!");
    setDeletingProduct(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm onProductAdd={handleAddProduct} onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          {editingProduct && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <EditProductForm
                  initialProduct={editingProduct}
                  onProductUpdate={handleUpdateProduct}
                  onClose={() => setIsEditDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}

          {deletingProduct && (
            <DeleteProductDialog
              product={deletingProduct}
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
              onConfirm={confirmDeleteProduct}
            />
          )}

          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductTable
            products={products}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct} // Pass the new delete handler
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;