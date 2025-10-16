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
    newStock: number, // This is the *new total* stock if no storeId, or *new store stock* if storeId is provided
    historyType: InventoryHistoryType,
    referenceId: string,
    reason?: string,
    storeId?: string, // Optional: for per-store stock updates
    userId?: string,
    productName?: string
  ) => void;
  updateProduct: (updatedProduct: Product) => void;
  addProduct: (newProduct: Product) => void;
  deleteProduct: (productId: string) => void;
  reassignProductsToCategory: (oldCategoryId: string, newCategoryId: string) => void;
  getEffectiveProductStock: (productId: string, storeId?: string) => number; // New helper
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { addHistoryEntry } = useInventoryHistory();
  const { user: authUser } = useAuth();

  // Helper to get the effective stock for a product, optionally for a specific store
  const getEffectiveProductStock = useCallback((productId: string, storeId?: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    if (storeId && product.stockByStore) {
      return product.stockByStore[storeId] || 0;
    }
    return product.stock; // Fallback to global stock
  }, [products]);

  const updateProductStock = useCallback((
    productId: string,
    newStockValue: number, // This is the *new total* stock if no storeId, or *new store stock* if storeId is provided
    historyType: InventoryHistoryType,
    referenceId: string,
    reason?: string,
    storeId?: string, // Optional: for per-store stock updates
    userId?: string,
    productName?: string
  ) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          let currentStockForHistory = p.stock; // Default to global stock for history
          let quantityChange = 0;
          const updatedProduct = { ...p };

          if (storeId && updatedProduct.stockByStore) {
            const currentStoreStock = updatedProduct.stockByStore[storeId] || 0;
            quantityChange = newStockValue - currentStoreStock;
            updatedProduct.stockByStore = {
              ...updatedProduct.stockByStore,
              [storeId]: newStockValue,
            };
            // Recalculate total stock if stockByStore is being used
            updatedProduct.stock = Object.values(updatedProduct.stockByStore).reduce((sum, qty) => sum + qty, 0);
            currentStockForHistory = newStockValue; // For history, log the specific store's new stock
          } else {
            // Update global stock
            quantityChange = newStockValue - p.stock;
            updatedProduct.stock = newStockValue;
            currentStockForHistory = newStockValue;
          }

          if (quantityChange !== 0) {
            addHistoryEntry({
              type: historyType,
              referenceId: referenceId,
              description: reason || `Stock updated from ${p.stock} to ${newStockValue}`,
              productId: productId,
              productName: productName || p.name,
              quantityChange: quantityChange,
              currentStock: currentStockForHistory, // Log the relevant stock
              storeId: storeId,
              userId: userId || authUser?.id,
            });
          }
          return updatedProduct;
        }
        return p;
      })
    );
  }, [addHistoryEntry, authUser]); // getEffectiveProductStock uses products from closure

  const addProduct = useCallback((newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    // If newProduct has stockByStore, calculate initial total stock
    const initialTotalStock = newProduct.stockByStore
      ? Object.values(newProduct.stockByStore).reduce((sum, qty) => sum + qty, 0)
      : newProduct.stock;

    addHistoryEntry({
      type: InventoryHistoryType.INITIAL_STOCK,
      referenceId: newProduct.id,
      description: `New product "${newProduct.name}" added with initial stock of ${initialTotalStock}.`,
      productId: newProduct.id,
      productName: newProduct.name,
      quantityChange: initialTotalStock,
      currentStock: initialTotalStock,
      storeId: undefined, // storeId is not directly applicable here, or could be a default store
      userId: authUser?.id,
    });
  }, [addHistoryEntry, authUser]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === updatedProduct.id) {
          // Calculate old and new total stock for history
          const oldTotalStock = p.stockByStore
            ? Object.values(p.stockByStore).reduce((sum, qty) => sum + qty, 0)
            : p.stock;
          const newTotalStock = updatedProduct.stockByStore
            ? Object.values(updatedProduct.stockByStore).reduce((sum, qty) => sum + qty, 0)
            : updatedProduct.stock;

          const quantityChange = newTotalStock - oldTotalStock;

          if (quantityChange !== 0) {
            addHistoryEntry({
              type: InventoryHistoryType.PRODUCT_EDIT,
              referenceId: updatedProduct.id,
              description: `Product "${updatedProduct.name}" stock manually updated from ${oldTotalStock} to ${newTotalStock}.`,
              productId: updatedProduct.id,
              productName: updatedProduct.name,
              quantityChange: quantityChange,
              currentStock: newTotalStock,
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
        const totalStockToDelete = productToDelete.stockByStore
          ? Object.values(productToDelete.stockByStore).reduce((sum, qty) => sum + qty, 0)
          : productToDelete.stock;

        addHistoryEntry({
          type: InventoryHistoryType.PRODUCT_DELETED,
          referenceId: productId,
          description: `Product "${productToDelete.name}" deleted. All ${totalStockToDelete} units removed from stock.`,
          productId: productId,
          productName: productToDelete.name,
          quantityChange: -totalStockToDelete, // Reflects the removal of all stock
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
    <ProductContext.Provider value={{ products, updateProductStock, updateProduct, addProduct, deleteProduct, reassignProductsToCategory, getEffectiveProductStock }}>
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