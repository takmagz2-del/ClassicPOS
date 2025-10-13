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
import { Textarea } from "@/components/ui/textarea";
import { Supplier } from "@/types/supplier";

const formSchema = z.object({
  name: z.string().min(2, { message: "Supplier name must be at least 2 characters." }),
  contactPerson: z.string().optional().or(z.literal("")),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  vatNumber: z.string().optional().or(z.literal("")), // New: VAT number field
  tinNumber: z.string().optional().or(z.literal("")), // New: TIN number field
});

type SupplierFormValues = z.infer<typeof formSchema>;

interface SupplierUpsertFormProps {
  initialSupplier?: Supplier;
  onSupplierSubmit: (supplierData: Omit<Supplier, "id"> | Supplier) => void;
  onClose: () => void;
}

const SupplierUpsertForm = ({ initialSupplier, onSupplierSubmit, onClose }: SupplierUpsertFormProps) => {
  const isEditMode = !!initialSupplier;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialSupplier || {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      vatNumber: "", // Default for new field
      tinNumber: "", // Default for new field
    },
  });

  useEffect(() => {
    form.reset(initialSupplier || {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      vatNumber: "",
      tinNumber: "",
    });
  }, [initialSupplier, form]);

  const onSubmit = (values: SupplierFormValues) => {
    if (isEditMode) {
      const updatedSupplier: Supplier = { ...initialSupplier!, ...values };
      onSupplierSubmit(updatedSupplier);
    } else {
      onSupplierSubmit(values as Omit<Supplier, "id">);
    }
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
              <FormLabel>Supplier Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tech Innovations Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., contact@supplier.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 555-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Industrial Way" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vatNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VAT Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., GB123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tinNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TIN Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123-456-789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any relevant notes about this supplier..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {isEditMode ? "Save Changes" : "Add Supplier"}
        </Button>
      </form>
    </Form>
  );
};

export default SupplierUpsertForm;