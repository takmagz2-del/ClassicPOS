"use client";

import React, { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns"; // Import startOfDay
import { Calendar } from "@/components/ui/calendar";
import { GoodsReceivedNote, GRNItem, GRNStatus } from "@/types/inventory";
import { useSuppliers } from "@/context/SupplierContext";
import { useStores } from "@/context/StoreContext";
import { useProducts } from "@/context/ProductContext";
import { usePurchaseOrders } from "@/context/PurchaseOrderContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  purchaseOrderId: z.string().optional().or(z.literal("")),
  supplierId: z.string().min(1, { message: "Supplier is required." }),
  referenceNo: z.string().min(1, { message: "Reference number is required." }),
  receivedDate: z.date({ required_error: "Received date is required." }),
  receivingStoreId: z.string().min(1, { message: "Receiving store is required." }),
  items: z.array(z.object({
    productId: z.string().min(1, { message: "Product is required." }),
    quantityReceived: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }),
    unitCost: z.coerce.number().min(0.01, { message: "Unit cost must be a positive number." }),
  })).min(1, { message: "At least one item is required." }),
  notes: z.string().optional().or(z.literal("")),
});

type GRNFormValues = z.infer<typeof formSchema>;

interface GRNUpsertFormProps {
  initialGRN?: GoodsReceivedNote;
  onGRNSubmit: (grn: GoodsReceivedNote | Omit<GoodsReceivedNote, "id" | "status" | "supplierName" | "receivingStoreName" | "approvedByUserName" | "approvalDate">) => void;
  onClose: () => void;
}

const GRNUpsertForm = ({ initialGRN, onGRNSubmit, onClose }: GRNUpsertFormProps) => {
  const isEditMode = !!initialGRN;
  const { suppliers } = useSuppliers();
  const { stores } = useStores();
  const { products } = useProducts();
  const { purchaseOrders, getPurchaseOrderById } = usePurchaseOrders();

  const form = useForm<GRNFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchaseOrderId: initialGRN?.purchaseOrderId || "",
      supplierId: initialGRN?.supplierId || "",
      referenceNo: initialGRN?.referenceNo || "",
      receivedDate: initialGRN?.receivedDate ? new Date(initialGRN.receivedDate) : startOfDay(new Date()), // Use startOfDay
      receivingStoreId: initialGRN?.receivingStoreId || "",
      items: initialGRN?.items.map(item => ({
        productId: item.productId,
        quantityReceived: item.quantityReceived,
        unitCost: item.unitCost,
      })) || [{ productId: "", quantityReceived: 1, unitCost: 0 }],
      notes: initialGRN?.notes || "",
    },
  });

  const selectedPurchaseOrderId = form.watch("purchaseOrderId");

  useEffect(() => {
    if (selectedPurchaseOrderId && selectedPurchaseOrderId !== "none") {
      const po = getPurchaseOrderById(selectedPurchaseOrderId);
      if (po) {
        form.setValue("supplierId", po.supplierId);
        form.setValue("items", po.items.map(item => ({
          productId: item.productId,
          quantityReceived: item.quantity,
          unitCost: item.unitCost,
        })));
        // Optionally set referenceNo or notes from PO
        form.setValue("notes", `Linked to PO: ${po.referenceNo}`);
      }
    } else if (!isEditMode) {
      // Clear PO-related fields if "none" is selected and not in edit mode
      form.setValue("supplierId", "");
      form.setValue("items", [{ productId: "", quantityReceived: 1, unitCost: 0 }]);
      form.setValue("notes", "");
    }
  }, [selectedPurchaseOrderId, getPurchaseOrderById, form, isEditMode]);

  useEffect(() => {
    if (initialGRN) {
      form.reset({
        purchaseOrderId: initialGRN.purchaseOrderId || "",
        supplierId: initialGRN.supplierId,
        referenceNo: initialGRN.referenceNo,
        receivedDate: new Date(initialGRN.receivedDate),
        receivingStoreId: initialGRN.receivingStoreId,
        items: initialGRN.items.map(item => ({
          productId: item.productId,
          quantityReceived: item.quantityReceived,
          unitCost: item.unitCost,
        })),
        notes: initialGRN.notes,
      });
    } else {
      form.reset({
        purchaseOrderId: "",
        supplierId: "",
        referenceNo: "",
        receivedDate: startOfDay(new Date()), // Use startOfDay
        receivingStoreId: "",
        items: [{ productId: "", quantityReceived: 1, unitCost: 0 }],
        notes: "",
      });
    }
  }, [initialGRN, form]);

  const onSubmit = (values: GRNFormValues) => {
    const totalValue = values.items.reduce((sum, item) => sum + (item.quantityReceived * item.unitCost), 0);

    const grnItems: GRNItem[] = values.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || "Unknown Product",
        quantityReceived: item.quantityReceived,
        unitCost: item.unitCost,
        totalCost: item.quantityReceived * item.unitCost,
      };
    });

    const baseGRN = {
      purchaseOrderId: values.purchaseOrderId === "none" ? undefined : values.purchaseOrderId,
      supplierId: values.supplierId,
      referenceNo: values.referenceNo,
      receivedDate: values.receivedDate.toISOString(),
      receivingStoreId: values.receivingStoreId,
      items: grnItems,
      totalValue: totalValue,
      notes: values.notes,
    };

    let grnToSubmit: GoodsReceivedNote | Omit<GoodsReceivedNote, "id" | "status" | "supplierName" | "receivingStoreName" | "approvedByUserName" | "approvalDate">;

    if (isEditMode) {
      grnToSubmit = {
        ...initialGRN!, // Keep existing status, approvedBy, etc.
        ...baseGRN,
        id: initialGRN!.id,
      };
    } else {
      grnToSubmit = baseGRN;
    }

    onGRNSubmit(grnToSubmit);
    onClose();
  };

  const items = form.watch("items");

  const handleAddItem = () => {
    form.setValue("items", [...items, { productId: "", quantityReceived: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    form.setValue("items", newItems);
  };

  const availablePurchaseOrders = purchaseOrders.filter(po => po.status === "pending" || po.status === "completed"); // Can link to pending or completed POs

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="purchaseOrderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to Purchase Order (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Purchase Order" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No Purchase Order</SelectItem>
                  {availablePurchaseOrders.map((po) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.referenceNo} ({suppliers.find(s => s.id === po.supplierId)?.name || "Unknown"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Linking to a PO will pre-fill supplier and item details.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedPurchaseOrderId && selectedPurchaseOrderId !== "none"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
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
          name="referenceNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., GRN-2023-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="receivedDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Received Date</FormLabel>
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
          name="receivingStoreId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receiving Store</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a receiving store" />
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
            <CardTitle className="text-base">Received Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} disabled={!!selectedPurchaseOrderId && selectedPurchaseOrderId !== "none"}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-2 border-b pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedPurchaseOrderId && selectedPurchaseOrderId !== "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} (SKU: {product.sku})
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
                    name={`items.${index}.quantityReceived`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity Received</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitCost`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Cost</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {items.length > 1 && (!selectedPurchaseOrderId || selectedPurchaseOrderId === "none") && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="sr-only">Remove Item</span>
                  </Button>
                )}
              </div>
            ))}
            {form.formState.errors.items && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.items.message}
              </p>
            )}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes for this Goods Received Note..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isEditMode && initialGRN?.status === "approved"}>
          {isEditMode ? "Save Changes" : "Create GRN"}
        </Button>
        {isEditMode && initialGRN?.status === "approved" && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            Approved GRNs cannot be edited.
          </p>
        )}
      </form>
    </Form>
  );
};

export default GRNUpsertForm;