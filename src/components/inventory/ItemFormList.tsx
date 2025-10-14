"use client";

import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

// Extend TItem to ensure it has an 'id' property
interface ItemWithId {
  id: string;
  [key: string]: any; // Allow other properties
}

interface ItemFormListProps<TFormValues extends { items: TItem[] }, TItem extends ItemWithId> {
  items: TItem[];
  onRemoveItem: (index: number) => void;
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  renderItem: (
    item: TItem,
    index: number,
    control: Control<TFormValues>,
    errors: FieldErrors<TFormValues>,
    isFormDisabled: boolean,
  ) => React.ReactNode;
  isRemoveButtonDisabled?: boolean;
  isFormDisabled?: boolean;
}

const ItemFormList = <TFormValues extends { items: TItem[] }, TItem extends ItemWithId>({
  items,
  onRemoveItem,
  control,
  errors,
  renderItem,
  isRemoveButtonDisabled = false,
  isFormDisabled = false,
}: ItemFormListProps<TFormValues, TItem>) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-end gap-2 border-b pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
            {renderItem(item, index, control, errors, isFormDisabled)}
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