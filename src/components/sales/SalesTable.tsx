"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sale } from "@/types/sale";
import { format } from "date-fns";
import { useCurrency } from "@/context/CurrencyContext"; // Import useCurrency
import { formatCurrency } from "@/lib/utils"; // Import formatCurrency
import { Button } from "@/components/ui/button"; // Import Button
import { Printer, Undo2 } from "lucide-react"; // Import Printer and Undo2 icons

interface SalesTableProps {
  sales: Sale[];
  onViewReceipt: (sale: Sale) => void;
  onRefundSale: (sale: Sale) => void; // New prop for refunding a sale
}

const SalesTable = ({ sales, onViewReceipt, onRefundSale }: SalesTableProps) => {
  const { currentCurrency } = useCurrency(); // Use currentCurrency from context

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="text-right">Tax</TableHead>
            <TableHead className="text-right">Gift Card</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Type</TableHead> {/* New TableHead for Type */}
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length > 0 ? (
            sales.map((sale) => (
              <TableRow key={sale.id} className={sale.type === "refund" ? "bg-red-50 dark:bg-red-950" : ""}>
                <TableCell className="font-medium">{sale.id.substring(0, 8)}</TableCell>
                <TableCell>{format(new Date(sale.date), "MMM dd, yyyy HH:mm")}</TableCell>
                <TableCell>
                  {sale.items.map((item) => (
                    <div key={item.productId} className="text-sm text-muted-foreground">
                      {item.quantity}x {item.name} ({formatCurrency(item.price, currentCurrency)})
                    </div>
                  ))}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(sale.subtotal, currentCurrency)}</TableCell>
                <TableCell className="text-right">{formatCurrency(sale.tax, currentCurrency)}</TableCell>
                <TableCell className="text-right">
                  {sale.giftCardAmountUsed ? `-${formatCurrency(sale.giftCardAmountUsed, currentCurrency)}` : formatCurrency(0, currentCurrency)}
                </TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(sale.total, currentCurrency)}</TableCell>
                <TableCell className="text-center capitalize">{sale.status}</TableCell>
                <TableCell className="text-center capitalize">
                  <span className={sale.type === "refund" ? "text-destructive font-semibold" : ""}>
                    {sale.type}
                  </span>
                </TableCell> {/* New TableCell for Type */}
                <TableCell className="text-center flex justify-center items-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onViewReceipt(sale)}>
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">View/Print Receipt</span>
                  </Button>
                  {sale.type === "sale" && ( // Only show refund button for original sales
                    <Button variant="ghost" size="icon" onClick={() => onRefundSale(sale)}>
                      <Undo2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Refund Sale</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center"> {/* Updated colSpan */}
                No sales recorded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesTable;