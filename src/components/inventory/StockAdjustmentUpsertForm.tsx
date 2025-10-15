"use client";

import React, { useEffect, useState } from "react";
import { useForm, Control, FieldErrors } from "react-hook-form";
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
import ItemFormList from "./ItemFormList";
import ProductItemFields from "./ProductItemFields";

// Define item schema with required fields, including an ID
const stockAdjustmentItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().min(1, { message: "Product is required." }),
  productName: z.string().min(1, { message: "Product name is required." }),
  adjustmentType: z.nativeEnum(AdjustmentType, { message: "Adjustment type is required." }),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }),
  reason: z.string().min(3, { message: "Reason for adjustment is required." }),
});

const formSchema = z.object({
  adjustmentDate: z.date({ required_error: "Adjustment date is required." }),
  storeId: z.string().min(1, { message: "Store is required." }),
  items: z.array(stockAdjustmentItemSchema).min(1, { message: "At least one item is required for adjustment." }),
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
      items: initialStockAdjustment?.items?.length
        ? initialStockAdjustment.items.map(item => ({ ...item, id: item.id || crypto.randomUUID() }))
        : [{ id: crypto.randomUUID(), productId: "", productName: "", adjustmentType: AdjustmentType.Increase, quantity: 1, reason: "" }],
      notes: initialStockAdjustment?.notes || undefined,
    },
  });

  const isFormDisabled = false;

  useEffect(() => {
    if (initialStockAdjustment) {
      form.reset({
        adjustmentDate: new Date(initialStockAdjustment.adjustmentDate),
        storeId: initialStockAdjustment.storeId,
        items: initialStockAdjustment.items.map(item => ({ ...item, id: item.id || crypto.randomUUID() })),
        notes: initialStockAdjustment.notes || undefined,
      });
    } else {
      form.reset({
        adjustmentDate: startOfDay(new Date()),
        storeId: "",
        items: [{ id: crypto.randomUUID(), productId: "", productName: "", adjustmentType: AdjustmentType.Increase, quantity: 1, reason: "" }],
        notes: undefined,
      });
    }
  }, [initialStockAdjustment, form]);

  // Effect to automatically populate productName
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("items.")) {
        const items = value.items;
        if (items) {
          items.forEach((item, index) => {
            const product = products.find(p => p.id === item.productId);
            if (product && item.productName !== product.name) {
              form.setValue(`items.${index}.productName`, product.name, { shouldValidate: true });
            } else if (!product && item.productName !== "") {
              form.setValue(`items.${index}.productName`, "", { shouldValidate: true });
            }
          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, products]);

  const onSubmit = (values: StockAdjustmentFormValues) => {
    // Explicitly cast values.items to StockAdjustmentItem[]
    const adjustmentItems: StockAdjustmentItem[] = values.items as StockAdjustmentItem[];

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

  // Explicitly cast the result of form.watch("items") with non-null assertion
  const items = form.watch("items")! as z.infer<typeof stockAdjustmentItemSchema>[] || [];

  const handleAddItem = () => {
    form.setValue("items", [...items, { id: crypto.randomUUID(), productId: "", productName: "", adjustmentType: AdjustmentType.Increase, quantity: 1, reason: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    form.setValue("items", newItems);
  };

  return (
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
                      disabled={isFormDisabled}
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
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={isFormDisabled}>
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
            <ItemFormList<StockAdjustmentFormValues, z.infer<typeof stockAdjustmentItemSchema>>
              items={items}
              onRemoveItem={handleRemoveItem}
              onAddItem={handleAddItem}
              control={form.control}
              errors={form.formState.errors}
              renderItem={(item, idx, ctrl, errs, isDisabled) => (
                <ProductItemFields<StockAdjustmentFormValues, z.infer<typeof stockAdjustmentItemSchema>>
                  index={idx}
                  control={ctrl}
                  errors={errs}
                  isFormDisabled={isDisabled}
                  itemType="stockAdjustment"
                />
              )}
              isRemoveButtonDisabled={isFormDisabled}
              isFormDisabled={isFormDisabled}
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
                <Textarea placeholder="Any additional notes for this stock adjustment..." {...field} disabled={isFormDisabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isFormDisabled}>
          {isEditMode ? "Save Changes" : "Create Adjustment"}
        </Button>
      </form>
    </Form>
  );
};

export default StockAdjustmentUpsertForm;