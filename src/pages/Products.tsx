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
import DeleteProductDialog from "@/components/products/DeleteProductDialog";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/context/ProductContext"; // Import useProducts

const Products = () => {
  const { logout } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts(); // Use products and functions from context
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const handleAddProduct = (newProduct: Product) => {
    addProduct(newProduct);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    updateProduct(updatedProduct);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = (productId: string) => {
    deleteProduct(productId);
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
            onDeleteProduct={handleDeleteProduct}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;