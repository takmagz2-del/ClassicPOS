"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Product } from "@/types/product";
import { mockProducts } from "@/data/mockProducts";
import { useInventoryHistory } from "./InventoryHistoryContext";
import { InventoryHistoryType } from "@/types/inventory";
import { useAuth } from "@/components/auth/AuthContext";

interface ProductContextType {
  products: Product[];
  updateProductStock: (
    productId: string,
    newStock: number,
    historyType: InventoryHistoryType,
    referenceId: string,
    reason?: string,
    storeId?: string,
    userId?: string,
    productName?: string // Added productName to the signature
  ) => void;
  updateProduct: (updatedProduct: Product) => void;
  addProduct: (newProduct: Product) => void;
  deleteProduct: (productId: string) => void;
  reassignProductsToCategory: (oldCategoryId: string, newCategoryId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { addHistoryEntry } = useInventoryHistory();
  const { user: authUser } = useAuth();

  const updateProductStock = useCallback((
    productId: string,
    newStock: number,
    historyType: InventoryHistoryType,
    referenceId: string,
    reason?: string,
    storeId?: string,
    userId?: string,
    productName?: string // Added productName to the function parameters
  ) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const quantityChange = newStock - p.stock;
          if (quantityChange !== 0) {
            addHistoryEntry({
              type: historyType,
              referenceId: referenceId,
              description: reason || `Stock updated from ${p.stock} to ${newStock}`,
              productId: productId,
              productName: productName || p.name, // Use passed productName or fallback to p.name
              quantityChange: quantityChange,
              currentStock: newStock,
              storeId: storeId,
              userId: userId || authUser?.id,
            });
          }
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  }, [addHistoryEntry, authUser]);

  const addProduct = useCallback((newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    addHistoryEntry({
      type: InventoryHistoryType.INITIAL_STOCK,
      referenceId: newProduct.id,
      description: `New product "${newProduct.name}" added with initial stock of ${newProduct.stock}.`,
      productId: newProduct.id,
      productName: newProduct.name,
      quantityChange: newProduct.stock,
      currentStock: newProduct.stock,
      storeId: undefined, // storeId is not directly applicable here, or could be a default store
      userId: authUser?.id,
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
              description: `Product "${updatedProduct.name}" stock manually updated from ${p.stock} to ${updatedProduct.stock}.`,
              productId: updatedProduct.id,
              productName: updatedProduct.name,
              quantityChange: quantityChange,
              currentStock: updatedProduct.stock,
              storeId: undefined, // storeId not specified for general product edit
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
          type: InventoryHistoryType.PRODUCT_DELETED,
          referenceId: productId,
          description: `Product "${productToDelete.name}" deleted. All ${productToDelete.stock} units removed from stock.`,
          productId: productId,
          productName: productToDelete.name,
          quantityChange: -productToDelete.stock, // Reflects the removal of all stock
          currentStock: 0, // Stock becomes 0 after deletion
          storeId: undefined,
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
    <ProductContext.Provider value={{ products, updateProductStock, updateProduct, addProduct, deleteProduct, reassignProductsToCategory }}>
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