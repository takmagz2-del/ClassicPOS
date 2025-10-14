"use client";

import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/context/ProductContext";
import { useStores } from "@/context/StoreContext";
import { AdjustmentType } from "@/types/inventory";

interface ProductItemFieldsProps<TFormValues, TItem> {
  index: number;
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  isFormDisabled: boolean;
  itemType: "purchaseOrder" | "grn" | "stockAdjustment" | "transferOfGoods";
  // Specific fields for transfer of goods to filter products by store if needed
  transferFromStoreId?: string;
}

const ProductItemFields = <TFormValues extends { items: TItem[] }, TItem>({
  index,
  control,
  errors,
  isFormDisabled,
  itemType,
  transferFromStoreId,
}: ProductItemFieldsProps<TFormValues, TItem>) => {
  const { products } = useProducts();
  const { stores } = useStores(); // Although not fully used for multi-store stock, it's available

  const getAvailableProducts = () => {
    if (itemType === "transferOfGoods" && transferFromStoreId) {
      // In a real multi-store app, you'd filter products based on stock in `transferFromStoreId`
      // For this mock, we'll just filter by trackStock and stock > 0 globally.
      return products.filter(p => p.trackStock && p.stock > 0);
    }
    return products;
  };

  return (
    <>
      <FormField
        control={control}
        name={`items.${index}.productId` as any} // Type assertion
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
                    {itemType === "transferOfGoods" && product.trackStock && ` - Stock: ${product.stock}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {(itemType === "purchaseOrder" || itemType === "grn" || itemType === "transferOfGoods") && (
        <FormField
          control={control}
          name={`items.${index}.quantity` as any} // Type assertion
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  value={field.value === undefined || field.value === null ? "" : field.value}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(itemType === "purchaseOrder" || itemType === "grn") && (
        <FormField
          control={control}
          name={`items.${index}.unitCost` as any} // Type assertion
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Cost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...field}
                  value={field.value === undefined || field.value === null ? "" : field.value}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {itemType === "stockAdjustment" && (
        <>
          <FormField
            control={control}
            name={`items.${index}.adjustmentType` as any} // Type assertion
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isFormDisabled}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(AdjustmentType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`items.${index}.quantity` as any} // Type assertion
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    value={field.value === undefined || field.value === null ? "" : field.value}
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`items.${index}.reason` as any} // Type assertion
            render={({ field }) => (
              <FormItem className="sm:col-span-3">
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Damaged stock, Found item"
                    {...field}
                    value={field.value === undefined || field.value === null ? "" : field.value}
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
};

export default ProductItemFields;