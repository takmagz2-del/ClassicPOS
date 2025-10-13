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
    userId?: string
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
    userId?: string
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
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts, newProduct];
      updateProductStock(
        newProduct.id,
        newProduct.stock,
        InventoryHistoryType.INITIAL_STOCK,
        newProduct.id,
        `New product "${newProduct.name}" added with initial stock of ${newProduct.stock}.`,
        undefined, // storeId is not directly applicable here, or could be a default store
        authUser?.id
      );
      return updatedProducts;
    });
  }, [updateProductStock, authUser]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === updatedProduct.id) {
          const quantityChange = updatedProduct.stock - p.stock;
          if (quantityChange !== 0) {
            updateProductStock(
              updatedProduct.id,
              updatedProduct.stock,
              InventoryHistoryType.PRODUCT_EDIT,
              updatedProduct.id,
              `Product "${updatedProduct.name}" stock manually updated from ${p.stock} to ${updatedProduct.stock}.`,
              undefined, // storeId not specified for general product edit
              authUser?.id
            );
          }
          return updatedProduct;
        }
        return p;
      })
    );
  }, [updateProductStock, authUser]);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prevProducts) => {
      const productToDelete = prevProducts.find(p => p.id === productId);
      if (productToDelete) {
        updateProductStock(
          productId,
          0, // Stock becomes 0 after deletion
          InventoryHistoryType.PRODUCT_EDIT,
          productId,
          `Product "${productToDelete.name}" deleted. All ${productToDelete.stock} units removed from stock.`,
          undefined,
          authUser?.id
        );
      }
      return prevProducts.filter((p) => p.id !== productId);
    });
  }, [updateProductStock, authUser]);

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