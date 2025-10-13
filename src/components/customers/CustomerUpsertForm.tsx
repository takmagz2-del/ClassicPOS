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
import { Customer } from "@/types/customer";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  loyaltyPoints: z.coerce.number().int().min(0, {
    message: "Loyalty points must be a non-negative integer.",
  }).default(0),
  vatNumber: z.string().optional().or(z.literal("")), // New: VAT number field
  tinNumber: z.string().optional().or(z.literal("")), // New: TIN number field
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerUpsertFormProps {
  initialCustomer?: Customer; // Optional: if provided, it's an edit operation
  onCustomerSubmit: (customer: Customer) => void;
  onClose: () => void;
}

const CustomerUpsertForm = ({ initialCustomer, onCustomerSubmit, onClose }: CustomerUpsertFormProps) => {
  const isEditMode = !!initialCustomer;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialCustomer || {
      name: "",
      email: "",
      phone: "",
      address: "",
      loyaltyPoints: 0,
      vatNumber: "", // Default for new field
      tinNumber: "", // Default for new field
    },
  });

  // Reset form with new initialCustomer if it changes
  useEffect(() => {
    form.reset(initialCustomer || {
      name: "",
      email: "",
      phone: "",
      address: "",
      loyaltyPoints: 0,
      vatNumber: "",
      tinNumber: "",
    });
  }, [initialCustomer, form]);

  const onSubmit = (values: CustomerFormValues) => {
    const customerToSubmit: Customer = isEditMode
      ? { // Explicitly construct the object for edit mode
          id: initialCustomer!.id,
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          loyaltyPoints: values.loyaltyPoints,
          vatNumber: values.vatNumber, // New field
          tinNumber: values.tinNumber, // New field
        }
      : { // Explicitly construct the object for add mode
          id: crypto.randomUUID(),
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          loyaltyPoints: values.loyaltyPoints,
          vatNumber: values.vatNumber, // New field
          tinNumber: values.tinNumber, // New field
        };

    onCustomerSubmit(customerToSubmit);
    toast.success(`Customer ${isEditMode ? "updated" : "added"} successfully!`);
    onClose();
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
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
                <Input placeholder="e.g., 123 Main St, Anytown" {...field} />
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
          name="loyaltyPoints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loyalty Points</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {isEditMode ? "Save Changes" : "Add Customer"}
        </Button>
      </form>
    </Form>
  );
};

export default CustomerUpsertForm;