"use client";

import React, { useEffect } from "react";
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
import { Product } from "@/types/product";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/context/CategoryContext";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  categoryId: z.string().min(1, {
    message: "Please select a category.",
  }),
  price: z.coerce.number().min(0.01, {
    message: "Price must be a positive number.",
  }),
  stock: z.coerce.number().int().min(0, {
    message: "Stock must be a non-negative integer.",
  }),
  sku: z.string().min(3, {
    message: "SKU must be at least 3 characters.",
  }),
});

type EditProductFormValues = z.infer<typeof formSchema>;

interface EditProductFormProps {
  initialProduct: Product;
  onProductUpdate: (updatedProduct: Product) => void;
  onClose: () => void;
}

const EditProductForm = ({ initialProduct, onProductUpdate, onClose }: EditProductFormProps) => {
  const { categories } = useCategories();

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialProduct, // Pre-fill form with initial product data
  });

  // Reset form with new initialProduct if it changes (e.g., when editing a different product)
  useEffect(() => {
    form.reset(initialProduct);
  }, [initialProduct, form]);

  const onSubmit = (values: EditProductFormValues) => {
    const updatedProduct: Product = {
      ...initialProduct, // Keep the original ID
      ...values,
    };
    onProductUpdate(updatedProduct);
    toast.success("Product updated successfully!");
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Laptop Pro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="e.g., LP-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
    </Form>
  );
};

export default EditProductForm;