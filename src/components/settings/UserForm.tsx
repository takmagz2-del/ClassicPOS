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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole } from "@/types/user";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
  role: z.nativeEnum(UserRole, { message: "Please select a valid role." }),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  initialUser?: User; // Optional for editing
  onUserSubmit: (values: { email: string; password?: string; role: UserRole }) => Promise<boolean>;
  onClose: () => void;
}

const UserForm = ({ initialUser, onUserSubmit, onClose }: UserFormProps) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialUser?.email || "",
      role: initialUser?.role || UserRole.EMPLOYEE, // Default to Employee for new users
      password: "", // Password is not pre-filled for security
    },
  });

  useEffect(() => {
    if (initialUser) {
      form.reset({
        email: initialUser.email,
        role: initialUser.role,
        password: "", // Always clear password field on reset
      });
    } else {
      form.reset({
        email: "",
        role: UserRole.EMPLOYEE,
        password: "",
      });
    }
  }, [initialUser, form]);

  const onSubmit = async (values: UserFormValues) => {
    const success = await onUserSubmit(values);
    if (success) {
      onClose();
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="e.g., user@example.com" {...field} disabled={!!initialUser} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{initialUser ? "New Password (optional)" : "Password"}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={initialUser ? "Leave blank to keep current" : "Enter password"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {initialUser ? "Save Changes" : "Add User"}
        </Button>
      </form>
    </Form>
  );
};

export default UserForm;