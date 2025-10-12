"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/context/CategoryContext";
import { Category } from "@/types/category";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, PlusCircle } from "lucide-react";
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
import { useProducts } from "@/context/ProductContext"; // Import useProducts to check for associated products

const formSchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
});

type CategoryFormValues = z.infer<typeof formSchema>;

const CategorySettingsForm = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { products } = useProducts(); // Get products to check for category usage

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [editingCategory, form, isAddEditDialogOpen]);

  const onSubmit = (values: CategoryFormValues) => {
    if (editingCategory) {
      updateCategory({ ...editingCategory, name: values.name });
    } else {
      addCategory(values.name);
    }
    setIsAddEditDialogOpen(false);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      const hasAssociatedProducts = products.some(product => product.categoryId === categoryToDelete.id);
      if (hasAssociatedProducts) {
        toast.error(`Cannot delete category "${categoryToDelete.name}" because it has associated products. Please reassign or delete products first.`);
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
        return;
      }
      deleteCategory(categoryToDelete.id);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Product Categories</CardTitle>
          <Button onClick={() => { setEditingCategory(null); setIsAddEditDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{category.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(category)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(category)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No product categories defined.</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</AlertDialogTitle>
            <AlertDialogDescription>
              {editingCategory ? "Modify the name of this category." : "Add a new product category to organize your catalog."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Electronics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsAddEditDialogOpen(false)}>Cancel</AlertDialogCancel>
                <Button type="submit">{editingCategory ? "Save Changes" : "Add Category"}</Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category{" "}
              <span className="font-semibold text-foreground">"{categoryToDelete?.name}"</span>.
              Any products currently assigned to this category will become "Uncategorized".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategorySettingsForm;