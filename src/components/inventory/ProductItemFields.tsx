"use client";

import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { AdjustmentType } from "@/types/inventory"; // Ensure AdjustmentType is imported if needed by sub-components

// Import the new specific item field components
import PurchaseOrderItemFields from "./PurchaseOrderItemFields";
import GrnItemFields from "./GrnItemFields";
import StockAdjustmentItemFields from "./StockAdjustmentItemFields";
import TransferOfGoodsItemFields from "./TransferOfGoodsItemFields";

interface ProductItemFieldsProps<TFormValues extends { items?: TItem[] }, TItem> { // Changed: items is now optional in TFormValues constraint
  index: number;
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  isFormDisabled: boolean;
  itemType: "purchaseOrder" | "grn" | "stockAdjustment" | "transferOfGoods";
  transferFromStoreId?: string; // Specific for TransferOfGoods
}

const ProductItemFields = <TFormValues extends { items?: TItem[] }, TItem>({ // Changed: items is now optional in TFormValues constraint
  index,
  control,
  errors,
  isFormDisabled,
  itemType,
  transferFromStoreId,
}: ProductItemFieldsProps<TFormValues, TItem>) => {
  switch (itemType) {
    case "purchaseOrder":
      return (
        <PurchaseOrderItemFields
          index={index}
          control={control}
          errors={errors}
          isFormDisabled={isFormDisabled}
        />
      );
    case "grn":
      return (
        <GrnItemFields
          index={index}
          control={control}
          errors={errors}
          isFormDisabled={isFormDisabled}
        />
      );
    case "stockAdjustment":
      return (
        <StockAdjustmentItemFields
          index={index}
          control={control}
          errors={errors}
          isFormDisabled={isFormDisabled}
        />
      );
    case "transferOfGoods":
      return (
        <TransferOfGoodsItemFields
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