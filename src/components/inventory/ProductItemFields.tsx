"use client";

import React from "react";
import { Control, FieldErrors, FieldValues } from "react-hook-form"; // Import FieldValues
import { AdjustmentType } from "@/types/inventory"; // Ensure AdjustmentType is imported if needed by sub-components

// Import the new specific item field components
import PurchaseOrderItemFields from "./PurchaseOrderItemFields";
import GrnItemFields from "./GrnItemFields";
import StockAdjustmentItemFields from "./StockAdjustmentItemFields";
import TransferOfGoodsItemFields from "./TransferOfGoodsItemFields";

// Define a more flexible TFormValues for ProductItemFields
interface ProductItemFieldsProps<TFormValues extends FieldValues, TItem> {
  index: number;
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  isFormDisabled: boolean;
  itemType: "purchaseOrder" | "grn" | "stockAdjustment" | "transferOfGoods";
  transferFromStoreId?: string; // Specific for TransferOfGoods
}

const ProductItemFields = <TFormValues extends FieldValues, TItem>({
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
          control={control as Control<any>} // Cast to any to bypass deep type checking
          errors={errors as FieldErrors<any>} // Cast to any
          isFormDisabled={isFormDisabled}
        />
      );
    case "grn":
      return (
        <GrnItemFields
          index={index}
          control={control as Control<any>} // Cast to any
          errors={errors as FieldErrors<any>} // Cast to any
          isFormDisabled={isFormDisabled}
        />
      );
    case "stockAdjustment":
      return (
        <StockAdjustmentItemFields
          index={index}
          control={control as Control<any>} // Cast to any
          errors={errors as FieldErrors<any>} // Cast to any
          isFormDisabled={isFormDisabled}
        />
      );
    case "transferOfGoods":
      return (
        <TransferOfGoodsItemFields
          index={index}
          control={control as Control<any>} // Cast to any
          errors={errors as FieldErrors<any>} // Cast to any
          isFormDisabled={isFormDisabled}
          transferFromStoreId={transferFromStoreId}
        />
      );
    default:
      return null;
  }
};

export default ProductItemFields;