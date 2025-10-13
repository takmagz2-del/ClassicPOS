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
import { TransferOfGoods, TransferOfGoodsItem } from "@/types/inventory";
import { useStores } from "@/context/StoreContext";
import { useProducts } from "@/context/ProductContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ItemFormList from "./ItemFormList";

const formSchema = z.object({
  transferDate: z.date({ required_error: "Transfer date is required." }),
  transferFromStoreId: z.string().min(1, { message: "Originating store is required." }),
  transferToStoreId: z.string().min(1, { message: "Destination store is required." }),
  items: z.array(z.object({
    productId: z.string().min(1, { message: "Product is required." }),
    quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }),
  })).min(1, { message: "At least one item is required for transfer." }),
  notes: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.transferFromStoreId && data.transferToStoreId && data.transferFromStoreId === data.transferToStoreId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Originating and destination stores cannot be the same.",
      path: ["transferToStoreId"],
    });
  }
});

type TransferOfGoodsFormValues = z.infer<typeof formSchema>;

interface TransferOfGoodsUpsertFormProps {
  initialTransfer?: TransferOfGoods;
  onTransferSubmit: (transfer: Omit<TransferOfGoods, "id" | "status" | "transferFromStoreName" | "transferToStoreName" | "approvedByUserName" | "approvalDate" | "receivedByUserName" | "receivedDate"> | TransferOfGoods) => void;
  onClose: () => void;
}

const TransferOfGoodsUpsertForm = ({ initialTransfer, onTransferSubmit, onClose }: TransferOfGoodsUpsertFormProps) => {
  const isEditMode = !!initialTransfer;
  const { stores } = useStores();
  const { products } = useProducts();

  const form = useForm<TransferOfGoodsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transferDate: initialTransfer?.transferDate ? new Date(initialTransfer.transferDate) : startOfDay(new Date()),
      transferFromStoreId: initialTransfer?.transferFromStoreId || "",
      transferToStoreId: initialTransfer?.transferToStoreId || "",
      items: initialTransfer?.items || [{ productId: "", quantity: 1 }],
      notes: initialTransfer?.notes || undefined,
    },
  });

  // Add custom validation for stock quantity
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith("items.") && (name.endsWith(".productId") || name.endsWith(".quantity"))) {
        const items = value.items;
        const transferFromStoreId = value.transferFromStoreId; // Get the selected 'from' store ID
        if (items && transferFromStoreId) {
          items.forEach((item, index) => {
            const product = products.find(p => p.id === item.productId);
            // In a real multi-store inventory, you'd check stock for the specific `transferFromStoreId`
            // For this mock, we're checking against the global product stock.
            if (product && product.trackStock && item.quantity > product.stock) {
              form.setError(`items.${index}.quantity`, {
                type: "manual",
                message: `Quantity exceeds available stock (${product.stock}).`,
              });
            } else {
              form.clearErrors(`items.${index}.quantity`);
            }
          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, products]);


  useEffect(() => {
    if (initialTransfer) {
      form.reset({
        transferDate: new Date(initialTransfer.transferDate),
        transferFromStoreId: initialTransfer.transferFromStoreId,
        transferToStoreId: initialTransfer.transferToStoreId,
        items: initialTransfer.items,
        notes: initialTransfer.notes || undefined,
      });
    } else {
      form.reset({
        transferDate: startOfDay(new Date()),
        transferFromStoreId: "",
        transferToStoreId: "",
        items: [{ productId: "", quantity: 1 }],
        notes: undefined,
      });
    }
  }, [initialTransfer, form]);

  const onSubmit = (values: TransferOfGoodsFormValues) => {
    const transferItems: TransferOfGoodsItem[] = values.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || "Unknown Product",
        quantity: item.quantity,
      };
    });

    const baseTransfer = {
      transferDate: values.transferDate.toISOString(),
      transferFromStoreId: values.transferFromStoreId,
      transferToStoreId: values.transferToStoreId,
      items: transferItems,
      notes: values.notes || undefined,
    };

    let transferToSubmit: Omit<TransferOfGoods, "id" | "status" | "transferFromStoreName" | "transferToStoreName" | "approvedByUserName" | "approvalDate" | "receivedByUserName" | "receivedDate"> | TransferOfGoods;

    if (isEditMode) {
      transferToSubmit = {
        ...initialTransfer!,
        ...baseTransfer,
        id: initialTransfer!.id,
      };
    } else {
      transferToSubmit = baseTransfer;
    }

    onTransferSubmit(transferToSubmit);
    onClose();
  };

  const items = form.watch("items");
  const transferFromStoreId = form.watch("transferFromStoreId");
  const isFormDisabled = isEditMode && initialTransfer?.status !== "pending"; // Centralized disabling logic

  const handleAddItem = () => {
    form.setValue("items", [...items, { productId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    form.setValue("items", newItems);
  };

  const getAvailableProductsForTransfer = (currentProductId?: string) => {
    // In a real multi-store app, this would filter products based on stock in `transferFromStoreId`
    // For this mock, we'll just filter by trackStock and stock > 0 globally.
    return products.filter(p => p.trackStock && p.stock > 0);
  };

  const renderTransferOfGoodsItem = (
    item: TransferOfGoodsItem,
    index: number,
    control: Control<TransferOfGoodsFormValues>,
    errors: FieldErrors<TransferOfGoodsFormValues>,
    extraProps?: { transferFromStoreId?: string; isRemoveDisabled?: boolean; isFormDisabled?: boolean }
  ) => (
    <>
      <FormField
        control={control}
        name={`items.${index}.productId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={extraProps?.isFormDisabled}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {getAvailableProductsForTransfer(item.productId).map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} (SKU: {product.sku}) - Stock: {product.stock}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`items.${index}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input type="number" min="1" {...field} disabled={extraProps?.isFormDisabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="transferDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Transfer Date</FormLabel>
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
          name="transferFromStoreId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Store (Origin)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select originating store" />
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
        <FormField
          control={form.control}
          name="transferToStoreId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To Store (Destination)</Label>
              <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination store" />
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Items to Transfer</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} disabled={isFormDisabled}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <ItemFormList<TransferOfGoodsItem>
              items={items}
              onRemoveItem={handleRemoveItem}
              control={form.control}
              errors={form.formState.errors}
              renderItem={renderTransferOfGoodsItem}
              isRemoveButtonDisabled={isFormDisabled}
              extraProps={{ transferFromStoreId, isFormDisabled }}
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
                <Textarea placeholder="Any additional notes for this transfer..." {...field} disabled={isFormDisabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isFormDisabled}>
          {isEditMode ? "Save Changes" : "Create Transfer"}
        </Button>
        {isFormDisabled && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            Only pending transfers can be edited.
          </p>
        )}
      </form>
    </Form>
  );
};

export default TransferOfGoodsUpsertForm;