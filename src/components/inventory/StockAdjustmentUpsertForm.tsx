"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form"; // Removed FormProvider import
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { StockAdjustment, AdjustmentType, StockAdjustmentItem } from "@/types/inventory";
import { useStores } from "@/context/StoreContext";
import { useProducts } from "@/context/ProductContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ItemFormList from "./ItemFormList"; // Import the new component

const formSchema = z.object({
  adjustmentDate: z.date({ required_error: "Adjustment date is required." }),
  storeId: z.string().min(1, { message: "Store is required." }),
  items: z.array(z.object({
    productId: z.string().min(1, { message: "Product is required." }),
    adjustmentType: z.nativeEnum(AdjustmentType, { message: "Adjustment type is required." }),
    quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }),
    reason: z.string().min(3, { message: "Reason for adjustment is required." }),
  })).min(1, { message: "At least one item is required for adjustment." }),
  notes: z.string().optional().or(z.literal("")),
});

type StockAdjustmentFormValues = z.infer<typeof formSchema>;

interface StockAdjustmentUpsertFormProps {
  initialStockAdjustment?: StockAdjustment;
  onStockAdjustmentSubmit: (adjustment: Omit<StockAdjustment, "id" | "storeName" | "approvedByUserName" | "approvalDate"> | StockAdjustment) => void;
  onClose: () => void;
}

const StockAdjustmentUpsertForm = ({ initialStockAdjustment, onStockAdjustmentSubmit, onClose }: StockAdjustmentUpsertFormProps) => {
  const isEditMode = !!initialStockAdjustment;
  const { stores } = useStores();
  const { products } = useProducts();

  const form = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adjustmentDate: initialStockAdjustment?.adjustmentDate ? new Date(initialStockAdjustment.adjustmentDate) : startOfDay(new Date()),
      storeId: initialStockAdjustment?.storeId || "",
      items: initialStockAdjustment?.items || [{ productId: "", adjustmentType: AdjustmentType.Increase, quantity: 1, reason: "" }],
      notes: initialStockAdjustment?.notes || undefined,
    },
  });

  useEffect(() => {
    if (initialStockAdjustment) {
      form.reset({
        adjustmentDate: new Date(initialStockAdjustment.adjustmentDate),
        storeId: initialStockAdjustment.storeId,
        items: initialStockAdjustment.items,
        notes: initialStockAdjustment.notes || undefined,
      });
    } else {
      form.reset({
        adjustmentDate: startOfDay(new Date()),
        storeId: "",
        items: [{ productId: "", adjustmentType: AdjustmentType.Increase, quantity: 1, reason: "" }],
        notes: undefined,
      });
    }
  }, [initialStockAdjustment, form]);

  const onSubmit = (values: StockAdjustmentFormValues) => {
    const adjustmentItems: StockAdjustmentItem[] = values.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || "Unknown Product",
        adjustmentType: item.adjustmentType,
        quantity: item.quantity,
        reason: item.reason,
      };
    });

    const baseAdjustment = {
      adjustmentDate: values.adjustmentDate.toISOString(),
      storeId: values.storeId,
      items: adjustmentItems,
      notes: values.notes || undefined,
    };

    let adjustmentToSubmit: Omit<StockAdjustment, "id" | "storeName" | "approvedByUserName" | "approvalDate"> | StockAdjustment;

    if (isEditMode) {
      adjustmentToSubmit = {
        ...initialStockAdjustment!,
        ...baseAdjustment,
        id: initialStockAdjustment!.id,
      };
    } else {
      adjustmentToSubmit = baseAdjustment;
    }

    onStockAdjustmentSubmit(adjustmentToSubmit);
    onClose();
  };

  const items = form.watch("items");

  const handleAddItem = () => {
    form.setValue("items", [...items, { productId: "", adjustmentType: AdjustmentType.Increase, quantity: 1, reason: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    form.setValue("items", newItems);
  };

  return (
    // Removed FormProvider
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="adjustmentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Adjustment Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items to Adjust</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemFormList
              items={items}
              products={products}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              formType="stockAdjustment"
              control={form.control} // Pass control
              errors={form.formState.errors} // Pass errors
            />
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes for this stock adjustment..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {isEditMode ? "Save Changes" : "Create Adjustment"}
        </Button>
      </form>
    </Form>
  );
};

export default StockAdjustmentUpsertForm;