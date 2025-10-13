"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Supplier } from "@/types/supplier";

interface DeleteSupplierDialogProps {
  supplier: Supplier;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (supplierId: string) => void;
}

const DeleteSupplierDialog = ({ supplier, isOpen, onClose, onConfirm }: DeleteSupplierDialogProps) => {
  const handleDelete = () => {
    onConfirm(supplier.id);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the supplier{" "}
            <span className="font-semibold text-foreground">"{supplier.name}"</span> from your records.
            <p className="mt-2 text-yellow-600 dark:text-yellow-400">
              Note: In a real application, deleting a supplier might require reassigning products or reviewing purchase orders. This is a simplified deletion.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSupplierDialog;