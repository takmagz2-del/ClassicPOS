"use client";

import React from "react";
import { Control, FieldErrors, FieldValues } from "react-hook-form"; // Import FieldValues

// Import the new specific item field components
import PurchaseOrderItemFields from "./PurchaseOrderItemFields";
import GrnItemFields from "./GrnItemFields";
import StockAdjustmentItemFields from "./StockAdjustmentItemFields";
import TransferOfGoodsItemFields from "./TransferOfGoodsItemFields";

// Define a more flexible TFormValues for ProductItemFields
interface ProductItemFieldsProps<TFormValues extends FieldValues> {
  index: number;
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  isFormDisabled: boolean;
  itemType: "purchaseOrder" | "grn" | "stockAdjustment" | "transferOfGoods";
  transferFromStoreId?: string; // Specific for TransferOfGoods
}

const ProductItemFields = <TFormValues extends FieldValues>({
  index,
  control,
  errors,
  isFormDisabled,
  itemType,
  transferFromStoreId,
}: ProductItemFieldsProps<TFormValues>) => {
  switch (itemType) {
    case "purchaseOrder":
      return (
        <PurchaseOrderItemFields<TFormValues> // Pass TFormValues
          index={index}
          control={control}
          errors={errors}
          isFormDisabled={isFormDisabled}
        />
      );
    case "grn":
      return (
        <GrnItemFields<TFormValues> // Pass TFormValues
          index={index}
          control={control}
          errors={errors}
          isFormDisabled={isFormDisabled}
        />
      );
    case "stockAdjustment":
      return (
        <StockAdjustmentItemFields<TFormValues> // Pass TFormValues
          index={index}
          control={control}
          errors={errors}
          isFormDisabled={isFormDisabled}
        />
      );
    case "transferOfGoods":
      return (
        <TransferOfGoodsItemFields<TFormValues> // Pass TFormValues
          index={index}
          control={control}
          errors={errors}
          isFormDisabled={isFormDisabled}
          transferFromStoreId={transferFromStoreId}
        />
      );
    default:
      return null;
  }
};

export default ProductItemFields;