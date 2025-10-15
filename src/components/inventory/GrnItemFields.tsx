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

interface GrnItemFieldsProps<TFormValues extends FieldValues> {
  index: number;
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  isFormDisabled: boolean;
}

const GrnItemFields = <TFormValues extends FieldValues>({
  index,
  control,
  errors,
  isFormDisabled,
}: GrnItemFieldsProps<TFormValues>) => {
  return (
    <>
      <ProductSelectField
        index={index}
        control={control}
        errors={errors}
        isFormDisabled={isFormDisabled}
      />
      <FormField
        control={control}
        name={`items.${index}.quantityReceived`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity Received</FormLabel>
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
        name={`items.${index}.unitCost`}
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
    </>
  );
};

export default GrnItemFields;