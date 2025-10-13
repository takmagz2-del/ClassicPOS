"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Product } from "@/types/product";
import { mockProducts } from "@/data/mockProducts";
import { useInventoryHistory } from "./InventoryHistoryContext"; // Import InventoryHistoryContext
import { InventoryHistoryType } from "@/types/inventory"; // Import InventoryHistoryType
import { useAuth } from "@/components/auth/AuthContext"; // Import useAuth

interface ProductContextType {
  products: Product[];
  updateProductStock: (productId: string, newStock: number, userId?: string, reason?: string) => void;
  increaseProductStock: (productId: string, quantity: number, userId?: string, reason?: string) => void;
  decreaseProductStock: (productId: string, quantity: number, userId?: string, reason?: string) => void; // New function
  updateProduct: (updatedProduct: Product) => void;
  addProduct: (newProduct: Product) => void;
  deleteProduct: (productId: string) => void;
  reassignProductsToCategory: (oldCategoryId: string, newCategoryId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { addHistoryEntry } = useInventoryHistory(); // Use addHistoryEntry
  const { user: authUser } = useAuth(); // Get logged-in user

  const updateProductStock = useCallback((productId: string, newStock: number, userId?: string, reason?: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const quantityChange = newStock - p.stock;
          if (quantityChange !== 0) {
            addHistoryEntry({
              type: InventoryHistoryType.PRODUCT_EDIT,
              referenceId: productId, // Reference the product itself
              description: reason || `Stock manually updated from ${p.stock} to ${newStock}`,
              productId: productId,
              quantityChange: quantityChange,
              currentStock: newStock,
              userId: userId || authUser?.id,
            });
          }
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  }, [addHistoryEntry, authUser]);

  const increaseProductStock = useCallback((productId: string, quantity: number, userId?: string, reason?: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const newStock = p.stock + quantity;
          addHistoryEntry({
            type: InventoryHistoryType.GRN, // Default type for increase, can be overridden
            referenceId: productId,
            description: reason || `Stock increased by ${quantity}`,
            productId: productId,
            quantityChange: quantity,
            currentStock: newStock,
            userId: userId || authUser?.id,
          });
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  }, [addHistoryEntry, authUser]);

  const decreaseProductStock = useCallback((productId: string, quantity: number, userId?: string, reason?: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock - quantity); // Ensure stock doesn't go below 0
          addHistoryEntry({
            type: InventoryHistoryType.SALE, // Default type for decrease, can be overridden
            referenceId: productId,
            description: reason || `Stock decreased by ${quantity}`,
            productId: productId,
            quantityChange: -quantity,
            currentStock: newStock,
            userId: userId || authUser?.id,
          });
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  }, [addHistoryEntry, authUser]);

  const addProduct = useCallback((newProduct: Product) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts, newProduct];
      addHistoryEntry({
        type: InventoryHistoryType.INITIAL_STOCK,
        referenceId: newProduct.id,
        description: `New product "${newProduct.name}" added with initial stock of ${newProduct.stock}.`,
        productId: newProduct.id,
        quantityChange: newProduct.stock,
        currentStock: newProduct.stock,
        userId: authUser?.id,
      });
      return updatedProducts;
    });
  }, [addHistoryEntry, authUser]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === updatedProduct.id) {
          const quantityChange = updatedProduct.stock - p.stock;
          if (quantityChange !== 0) {
            addHistoryEntry({
              type: InventoryHistoryType.PRODUCT_EDIT,
              referenceId: updatedProduct.id,
              description: `Product "${updatedProduct.name}" stock updated from ${p.stock} to ${updatedProduct.stock}.`,
              productId: updatedProduct.id,
              quantityChange: quantityChange,
              currentStock: updatedProduct.stock,
              userId: authUser?.id,
            });
          }
          return updatedProduct;
        }
        return p;
      })
    );
  }, [addHistoryEntry, authUser]);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prevProducts) => {
      const productToDelete = prevProducts.find(p => p.id === productId);
      if (productToDelete) {
        addHistoryEntry({
          type: InventoryHistoryType.PRODUCT_EDIT,
          referenceId: productId,
          description: `Product "${productToDelete.name}" deleted.`,
          productId: productId,
          quantityChange: -productToDelete.stock, // Log as a decrease of all stock
          currentStock: 0,
          userId: authUser?.id,
        });
      }
      return prevProducts.filter((p) => p.id !== productId);
    });
  }, [addHistoryEntry, authUser]);

  const reassignProductsToCategory = useCallback((oldCategoryId: string, newCategoryId: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.categoryId === oldCategoryId ? { ...product, categoryId: newCategoryId } : product
      )
    );
  }, []);

  return (
    <ProductContext.Provider value={{ products, updateProductStock, increaseProductStock, decreaseProductStock, updateProduct, addProduct, deleteProduct, reassignProductsToCategory }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};