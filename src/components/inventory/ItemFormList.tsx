"use client";

import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface ItemFormListProps<TItem> {
  items: TItem[];
  onRemoveItem: (index: number) => void;
  control: Control<any>;
  errors: FieldErrors<any>;
  renderItem: (
    item: TItem,
    index: number,
    control: Control<any>,
    errors: FieldErrors<any>,
  ) => React.ReactNode;
  isRemoveButtonDisabled?: boolean;
  isFormDisabled?: boolean; // Added isFormDisabled here
}

const ItemFormList = <TItem,>({
  items,
  onRemoveItem,
  control,
  errors,
  renderItem,
  isRemoveButtonDisabled = false,
  isFormDisabled = false, // Default to false
}: ItemFormListProps<TItem>) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-end gap-2 border-b pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
            {renderItem(item, index, control, errors)}
          </div>
          {items.length > 0 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)} disabled={isRemoveButtonDisabled || isFormDisabled}>
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