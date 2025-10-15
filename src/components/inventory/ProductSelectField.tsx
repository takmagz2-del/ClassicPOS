"use client";

import React from "react";
import { Control, FieldErrors, FieldValues } from "react-hook-form"; // Import FieldValues
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/context/ProductContext";

interface ProductSelectFieldProps<TFormValues extends FieldValues> {
  index: number;
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  isFormDisabled: boolean;
  // Optional: for filtering products based on a specific store's stock (e.g., for transfers)
  filterByStoreId?: string; 
}

const ProductSelectField = <TFormValues extends FieldValues>({
  index,
  control,
  errors,
  isFormDisabled,
  filterByStoreId,
}: ProductSelectFieldProps<TFormValues>) => {
  const { products } = useProducts();

  const getAvailableProducts = () => {
    // In a real multi-store app, you'd filter products based on stock in `filterByStoreId`
    // For this mock, we'll just filter by trackStock and stock > 0 globally if a store ID is provided.
    if (filterByStoreId) {
      return products.filter(p => p.trackStock && p.stock > 0);
    }
    return products;
  };

  return (
    <FormField
      control={control}
      name={`items.${index}.productId`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Product</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ""} disabled={isFormDisabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {getAvailableProducts().map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} (SKU: {product.sku})
                  {filterByStoreId && product.trackStock && ` - Stock: ${product.stock}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductSelectField;