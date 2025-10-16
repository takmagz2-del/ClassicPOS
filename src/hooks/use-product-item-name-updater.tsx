"use client";

import { useEffect } from "react";
import { FieldValues, Path, UseFormSetValue, UseFormWatch, UseFormGetValues } from "react-hook-form"; // Added UseFormWatch, UseFormGetValues
import { Product } from "@/types/product";

interface UseProductItemNameUpdaterProps<TFormValues extends FieldValues, TItem extends { productId: string; productName?: string }> {
  watch: UseFormWatch<TFormValues>; // Changed from control
  getValues: UseFormGetValues<TFormValues>; // Changed from control
  setValue: UseFormSetValue<TFormValues>;
  products: Product[];
  itemsFieldName: Path<TFormValues>; // e.g., "items"
}

/**
 * A custom hook to automatically update the 'productName' field of an item
 * in a react-hook-form array whenever its 'productId' changes.
 */
export function useProductItemNameUpdater<TFormValues extends FieldValues, TItem extends { productId: string; productName?: string }>({
  watch, // Destructure watch
  getValues, // Destructure getValues
  setValue,
  products,
  itemsFieldName,
}: UseProductItemNameUpdaterProps<TFormValues, TItem>) {
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      // Only react to changes in productId fields within the items array
      if (name?.startsWith(`${itemsFieldName}.`) && name.endsWith(".productId")) {
        const items = (value[itemsFieldName] || []) as TItem[];
        if (items) {
          // Extract the index from the changed field name
          const indexMatch = name.match(/\.(\d+)\.productId$/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1], 10);
            const item = items[index];

            if (item) {
              const product = products.find(p => p.id === item.productId);
              // Use getValues directly and assert the path
              const currentProductName = getValues(`${itemsFieldName}.${index}.productName` as Path<TFormValues>);

              if (product && currentProductName !== product.name) {
                // Assert the path for setValue
                setValue(`${itemsFieldName}.${index}.productName` as Path<TFormValues>, product.name as any, { shouldValidate: true });
              } else if (!product && currentProductName !== "") {
                // Assert the path for setValue
                setValue(`${itemsFieldName}.${index}.productName` as Path<TFormValues>, "" as any, { shouldValidate: true });
              }
            }
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, getValues, setValue, products, itemsFieldName]); // Updated dependencies
}