"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Category } from "@/types/category";
import { mockCategories } from "@/data/mockCategories";
import { toast } from "sonner";

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string) => void;
  updateCategory: (updatedCategory: Category) => void;
  deleteCategory: (id: string) => void;
  getCategoryName: (id: string) => string;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== "undefined") {
      const storedCategories = localStorage.getItem("productCategories");
      return storedCategories ? JSON.parse(storedCategories) : mockCategories;
    }
    return mockCategories;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("productCategories", JSON.stringify(categories));
    }
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
    if (categories.some(cat => cat.id !== updatedCategory.id && cat.name.toLowerCase() === updatedCategory.name.toLowerCase())) {
      toast.error(`Category "${updatedCategory.name}" already exists.`);
      return;
    }
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    toast.success(`Category "${updatedCategory.name}" updated.`);
  }, [categories]);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    toast.info("Category deleted.");
  }, []);

  const getCategoryName = useCallback((id: string) => {
    return categories.find(cat => cat.id === id)?.name || "Uncategorized";
  }, [categories]);

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, getCategoryName }}>
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