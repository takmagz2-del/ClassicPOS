"use client";

import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }).optional().or(z.literal("")),
  confirmNewPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "New passwords do not match.",
      path: ["confirmNewPassword"],
    });
  }
  if (data.newPassword && !data.currentPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Current password is required to change password.",
      path: ["currentPassword"],
    });
  }
});

type UserProfileFormValues = z.infer<typeof formSchema>;

const UserProfileForm = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: UserProfileFormValues) => {
    if (!user) return;

    setIsLoading(true);

    const updatedFields: Partial<typeof user> = {
      email: values.email,
    };

    const success = await updateUser(
      updatedFields,
      values.currentPassword || undefined,
      values.newPassword || undefined
    );

    setIsLoading(false);
    if (success) {
      toast.success("Profile updated successfully!");
      form.reset({
        email: values.email, // Keep current email
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } else {
      // Error message is already handled by AuthContext
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
                <Input placeholder="your@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter current password" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password (optional)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Leave blank to keep current" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm new password" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Profile Changes"}
        </Button>
      </form>
    </Form>
  );
};

export default UserProfileForm;