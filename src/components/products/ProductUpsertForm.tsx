"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";

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
  cost: z.coerce.number().min(0, {
    message: "Cost must be a non-negative number.",
  }),
  wholesalePrice: z.coerce.number().min(0, { // New: Wholesale price validation
    message: "Wholesale price must be a non-negative number.",
  }),
  stock: z.coerce.number().int().min(0, {
    message: "Stock must be a non-negative integer.",
  }),
  trackStock: z.boolean(), // New: Track stock switch
  availableForSale: z.boolean(), // New: Available for sale switch
  sku: z.string().min(3, {
    message: "SKU must be at least 3 characters.",
  }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductUpsertFormProps {
  initialProduct?: Product; // Optional: if provided, it's an edit operation
  onProductSubmit: (product: Product) => void;
  onClose: () => void;
}

const ProductUpsertForm = ({ initialProduct, onProductSubmit, onClose }: ProductUpsertFormProps) => {
  const { categories } = useCategories();
  const isEditMode = !!initialProduct;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialProduct || {
      name: "",
      categoryId: "",
      price: 0,
      cost: 0,
      wholesalePrice: 0, // Default for new field
      stock: 0,
      trackStock: true, // Default to true
      availableForSale: true, // Default to true
      sku: "",
      imageUrl: "",
    },
  });

  // Reset form with new initialProduct if it changes (e.g., when editing a different product)
  useEffect(() => {
    form.reset(initialProduct || {
      name: "",
      categoryId: "",
      price: 0,
      cost: 0,
      wholesalePrice: 0,
      stock: 0,
      trackStock: true,
      availableForSale: true,
      sku: "",
      imageUrl: "",
    });
  }, [initialProduct, form]);

  const onSubmit = (values: ProductFormValues) => {
    let productToSubmit: Product;

    if (isEditMode) {
      productToSubmit = {
        id: initialProduct!.id, // Ensure ID is from initialProduct
        name: values.name,
        categoryId: values.categoryId,
        price: values.price,
        cost: values.cost,
        wholesalePrice: values.wholesalePrice, // New field
        stock: values.stock,
        trackStock: values.trackStock, // New field
        availableForSale: values.availableForSale, // New field
        sku: values.sku,
        imageUrl: values.imageUrl,
      };
    } else {
      productToSubmit = {
        id: crypto.randomUUID(), // Generate new ID for add
        name: values.name,
        categoryId: values.categoryId,
        price: values.price,
        cost: values.cost,
        wholesalePrice: values.wholesalePrice, // New field
        stock: values.stock,
        trackStock: values.trackStock, // New field
        availableForSale: values.availableForSale, // New field
        sku: values.sku,
        imageUrl: values.imageUrl,
      };
    }

    onProductSubmit(productToSubmit);
    toast.success(`Product ${isEditMode ? "updated" : "added"} successfully!`);
    onClose();
    form.reset();
  };

  const trackStock = form.watch("trackStock");

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
              <Select onValueChange={field.onChange} value={field.value}>
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
              <FormLabel>Retail Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 850.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="wholesalePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wholesale Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 750.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="trackStock"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Track Stock</FormLabel>
                <FormDescription>
                  Enable to manage inventory levels for this product.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled={!trackStock} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="availableForSale"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Available for Sale</FormLabel>
                <FormDescription>
                  Toggle visibility and purchasability in the sales terminal.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {isEditMode ? "Save Changes" : "Add Product"}
        </Button>
      </form>
    </Form>
  );
};

export default ProductUpsertForm;