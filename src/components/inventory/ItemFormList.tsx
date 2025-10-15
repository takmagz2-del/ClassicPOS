"use client";

import React from "react";
import { Control, FieldErrors, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";

// Extend TItem to ensure it has an 'id' property
interface ItemWithId {
  id: string; // Changed to required
  [key: string]: any; // Allow other properties
}

// Constrain TFormValues to ensure it has an 'items' array of ItemWithId
interface ItemFormListProps<TFormValues extends FieldValues> {
  items: ItemWithId[]; // Directly use ItemWithId[]
  onRemoveItem: (index: number) => void;
  onAddItem: () => void; // New: Callback to add a new item
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  renderItem: (
    item: ItemWithId, // Changed to ItemWithId
    index: number,
    control: Control<TFormValues>,
    errors: FieldErrors<TFormValues>,
    isFormDisabled: boolean,
  ) => React.ReactNode;
  isRemoveButtonDisabled?: boolean;
  isFormDisabled?: boolean;
  renderAddButton?: (onAdd: () => void, isDisabled: boolean) => React.ReactNode; // New: Optional custom add button renderer
}

const ItemFormList = <TFormValues extends FieldValues>({
  items,
  onRemoveItem,
  onAddItem, // Destructure new prop
  control,
  errors,
  renderItem,
  isRemoveButtonDisabled = false,
  isFormDisabled = false,
  renderAddButton, // Destructure new prop
}: ItemFormListProps<TFormValues>) => {
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
      <div className="flex justify-end">
        {renderAddButton ? (
          renderAddButton(onAddItem, isFormDisabled)
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={onAddItem} disabled={isFormDisabled}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        )}
      </div>
    </div>
  );
};

export default ItemFormList;