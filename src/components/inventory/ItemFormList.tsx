"use client";

import React from "react";
import { Control, FieldErrors } from "react-hook-form"; // Import Control and FieldErrors types
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { Product } from "@/types/product";
import { AdjustmentType } from "@/types/inventory";

interface ItemFormListProps {
  items: any[]; // Can be PurchaseOrderItem, GRNItem, or StockAdjustmentItem
  products: Product[];
  onRemoveItem: (index: number) => void;
  formType: "purchaseOrder" | "grn" | "stockAdjustment" | "transfer";
  isLinkedToPO?: boolean; // Specific to GRN form
  transferFromStoreId?: string; // Specific to Transfer form
  control: Control<any>; // Add control prop
  errors: FieldErrors<any>; // Add errors prop
}

const ItemFormList = ({
  items,
  products,
  onRemoveItem,
  formType,
  isLinkedToPO = false,
  transferFromStoreId,
  control, // Destructure control
  errors, // Destructure errors
}: ItemFormListProps) => {
  // Removed useFormContext

  const getAvailableProducts = (itemProductId?: string) => {
    if (formType === "transfer" && transferFromStoreId) {
      // In a real app, you'd filter products by stock in the specific 'from' store
      // For this mock, we'll assume all products are available in all stores for simplicity,
      // but still filter by trackStock and stock > 0.
      return products.filter(p => p.trackStock && p.stock > 0);
    }
    return products;
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-end gap-2 border-b pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
            <FormField
              control={control}
              name={`items.${index}.productId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLinkedToPO}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getAvailableProducts(item.productId).map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (SKU: {product.sku})
                          {formType === "transfer" && product.trackStock && ` - Stock: ${product.stock}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formType === "stockAdjustment" && (
              <FormField
                control={control}
                name={`items.${index}.adjustmentType`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
            )}

            <FormField
              control={control}
              name={`items.${index}.${formType === "grn" ? "quantityReceived" : "quantity"}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} disabled={isLinkedToPO} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(formType === "purchaseOrder" || formType === "grn") && (
              <FormField
                control={control}
                name={`items.${index}.unitCost`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Cost</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" {...field} disabled={isLinkedToPO} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {formType === "stockAdjustment" && (
              <FormField
                control={control}
                name={`items.${index}.reason`}
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Damaged stock, Found item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          {items.length > 0 && !isLinkedToPO && ( // Only show remove button if there's at least one item
            <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)}>
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="sr-only">Remove Item</span>
            </Button>
          )}
        </div>
      ))}
      {errors.items && (
        <p className="text-sm font-medium text-destructive">
          {errors.items.message as string}
        </p>
      )}
    </div>
  );
};

export default ItemFormList;