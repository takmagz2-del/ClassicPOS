"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Category } from "@/types/category";
import { mockCategories } from "@/data/mockCategories";
import { toast } from "sonner";

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string) => void;
  updateCategory: (updatedCategory: Category) => void;
  deleteCategory: (id: string) => string | null; // Returns uncategorizedId if products need reassigning
  getCategoryName: (id: string) => string;
  getUncategorizedCategoryId: () => string; // New: Function to get the ID of the 'Uncategorized' category
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== "undefined") {
      const storedCategories = localStorage.getItem("productCategories");
      let initialCategories: Category[] = storedCategories ? JSON.parse(storedCategories) : mockCategories;

      // Ensure 'Uncategorized' category exists and is correctly formatted
      const uncategorizedIndex = initialCategories.findIndex(cat => cat.isUncategorized);
      if (uncategorizedIndex === -1) {
        initialCategories = [...initialCategories, { id: "cat-uncategorized", name: "Uncategorized", isUncategorized: true }];
      } else {
        // Ensure existing 'Uncategorized' has the correct ID and name
        initialCategories[uncategorizedIndex] = { id: "cat-uncategorized", name: "Uncategorized", isUncategorized: true };
      }
      return initialCategories;
    }
    return mockCategories;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("productCategories", JSON.stringify(categories));
    }
  }, [categories]);

  const getUncategorizedCategoryId = useCallback(() => {
    const uncategorized = categories.find(cat => cat.isUncategorized);
    // This should always exist due to initial state logic
    return uncategorized ? uncategorized.id : "cat-uncategorized";
  }, [categories]);

  const addCategory = useCallback((name: string) => {
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      toast.error(`Category "${name}" already exists.`);
      return;
    }
    const newCategory: Category = { id: crypto.randomUUID(), name };
    setCategories((prev) => [...prev, newCategory]);
    toast.success(`Category "${name}" added.`);
  }, [categories]);

  const updateCategory = useCallback((updatedCategory: Category) => {
    if (updatedCategory.isUncategorized) {
      toast.error("The 'Uncategorized' category cannot be edited.");
      return;
    }
    if (categories.some(cat => cat.id !== updatedCategory.id && cat.name.toLowerCase() === updatedCategory.name.toLowerCase())) {
      toast.error(`Category "${updatedCategory.name}" already exists.`);
      return;
    }
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    toast.success(`Category "${updatedCategory.name}" updated.`);
  }, [categories]);

  const deleteCategory = useCallback((id: string): string | null => {
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (!categoryToDelete) return null;

    if (categoryToDelete.isUncategorized) {
      toast.error("The 'Uncategorized' category cannot be deleted.");
      return null;
    }

    const uncategorizedId = getUncategorizedCategoryId();
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    toast.info(`Category "${categoryToDelete.name}" deleted.`);
    return uncategorizedId; // Return the ID of the uncategorized category for product reassignment
  }, [categories, getUncategorizedCategoryId]);

  const getCategoryName = useCallback((id: string) => {
    return categories.find(cat => cat.id === id)?.name || "Uncategorized";
  }, [categories]);

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, getCategoryName, getUncategorizedCategoryId }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
};