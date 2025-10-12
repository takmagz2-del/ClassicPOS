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
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }).optional().or(z.literal("")),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }).optional().or(z.literal("")),
});

type EditCustomerFormValues = z.infer<typeof formSchema>;

interface EditCustomerFormProps {
  initialCustomer: Customer;
  onCustomerUpdate: (updatedCustomer: Customer) => void;
  onClose: () => void;
}

const EditCustomerForm = ({ initialCustomer, onCustomerUpdate, onClose }: EditCustomerFormProps) => {
  const form = useForm<EditCustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialCustomer,
  });

  useEffect(() => {
    form.reset(initialCustomer);
  }, [initialCustomer, form]);

  const onSubmit = (values: EditCustomerFormValues) => {
    const updatedCustomer: Customer = {
      ...initialCustomer,
      ...values,
    };
    onCustomerUpdate(updatedCustomer);
    toast.success("Customer updated successfully!");
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
        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
    </Form>
  );
};

export default EditCustomerForm;