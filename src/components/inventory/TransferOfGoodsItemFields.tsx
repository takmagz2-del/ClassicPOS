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
import { Input } from "@/components/ui/input";
import ProductSelectField from "./ProductSelectField";

interface TransferOfGoodsItemFieldsProps<TFormValues extends FieldValues, TItem> {
  index: number;
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  isFormDisabled: boolean;
  transferFromStoreId?: string; // To pass to ProductSelectField for filtering
}

const TransferOfGoodsItemFields = <TFormValues extends FieldValues, TItem>({
  index,
  control,
  errors,
  isFormDisabled,
  transferFromStoreId,
}: TransferOfGoodsItemFieldsProps<TFormValues, TItem>) => {
  return (
    <>
      <ProductSelectField
        index={index}
        control={control}
        errors={errors}
        isFormDisabled={isFormDisabled}
        filterByStoreId={transferFromStoreId} // Pass store ID for filtering
      />
      <FormField
        control={control}
        name={`items.${index}.quantity` as any}
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
    </>
  );
};

export default TransferOfGoodsItemFields;