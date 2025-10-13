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
    // Optional props that might be needed by specific item renderers
    extraProps?: { isLinkedToPO?: boolean; transferFromStoreId?: string; isRemoveDisabled?: boolean }
  ) => React.ReactNode;
  isRemoveButtonDisabled?: boolean; // New prop to disable remove buttons
  extraProps?: { isLinkedToPO?: boolean; transferFromStoreId?: string }; // Pass through extra props
}

const ItemFormList = <TItem,>({
  items,
  onRemoveItem,
  control,
  errors,
  renderItem,
  isRemoveButtonDisabled = false,
  extraProps,
}: ItemFormListProps<TItem>) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-end gap-2 border-b pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
            {renderItem(item, index, control, errors, extraProps)}
          </div>
          {items.length > 0 && !isRemoveButtonDisabled && (
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