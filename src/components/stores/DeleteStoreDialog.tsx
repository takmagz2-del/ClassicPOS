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
import { Store } from "@/types/store";

interface DeleteStoreDialogProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (storeId: string) => void;
}

const DeleteStoreDialog = ({ store, isOpen, onClose, onConfirm }: DeleteStoreDialogProps) => {
  const handleDelete = () => {
    onConfirm(store.id);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the store{" "}
            <span className="font-semibold text-foreground">"{store.name}"</span>.
            <p className="mt-2 text-yellow-600 dark:text-yellow-400">
              Note: In a real application, deleting a store would require reassigning its inventory, sales records, and staff. This is a simplified deletion.
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

export default DeleteStoreDialog;