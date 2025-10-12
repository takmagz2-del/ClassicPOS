"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/context/SaleContext";
import SalesTable from "@/components/sales/SalesTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Sale, SaleItem } from "@/types/sale";
import ReceiptPreviewDialog from "@/components/sales/ReceiptPreviewDialog";
import RefundDialog from "@/components/sales/RefundDialog"; // Import RefundDialog
import { useCustomers } from "@/context/CustomerContext";
import { Customer } from "@/types/customer";
import { useProducts } from "@/context/ProductContext"; // Import useProducts
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext"; // Import useCurrency
import { formatCurrency } from "@/lib/utils"; // Import formatCurrency

const SalesHistory = () => {
  const { salesHistory, refundSale } = useSales();
  const { customers } = useCustomers();
  const { increaseProductStock } = useProducts(); // Use increaseProductStock
  const { currentCurrency } = useCurrency(); // Destructure currentCurrency from useCurrency

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all"); // New state for type filter
  const [sortKey, setSortKey] = useState<keyof Sale>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState<boolean>(false);
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);
  const [selectedCustomerForReceipt, setSelectedCustomerForReceipt] = useState<Customer | undefined>(undefined);

  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState<boolean>(false); // New state for refund dialog
  const [selectedSaleForRefund, setSelectedSaleForRefund] = useState<Sale | null>(null); // New state for selected sale to refund

  const filteredAndSortedSales = useMemo(() => {
    let filteredSales = salesHistory;

    // 1. Filter by search term (Sale ID or Customer Name)
    if (searchTerm) {
      filteredSales = filteredSales.filter(
        (sale) =>
          sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 2. Filter by date range
    if (dateRange.from) {
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.date);
        saleDate.setHours(0, 0, 0, 0); // Normalize to start of day
        const fromDate = new Date(dateRange.from!);
        fromDate.setHours(0, 0, 0, 0);
        return saleDate >= fromDate;
      });
    }
    if (dateRange.to) {
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.date);
        saleDate.setHours(0, 0, 0, 0); // Normalize to start of day
        const toDate = new Date(dateRange.to!);
        toDate.setHours(0, 0, 0, 0);
        return saleDate <= toDate;
      });
    }

    // 3. Filter by status
    if (statusFilter !== "all") {
      filteredSales = filteredSales.filter((sale) => sale.status === statusFilter);
    }

    // 4. Filter by type (Sale/Refund)
    if (typeFilter !== "all") {
      filteredSales = filteredSales.filter((sale) => sale.type === typeFilter);
    }

    // 5. Sort
    const sortedSales = [...filteredSales].sort((a, b) => {
      let compareValue = 0;
      if (sortKey === "date") {
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortKey === "total") {
        compareValue = a.total - b.total;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return sortedSales;
  }, [salesHistory, searchTerm, dateRange, statusFilter, typeFilter, sortKey, sortOrder]); // Added typeFilter to dependencies

  const handleViewReceipt = (sale: Sale) => {
    setSelectedSaleForReceipt(sale);
    if (sale.customerId) {
      setSelectedCustomerForReceipt(customers.find(c => c.id === sale.customerId));
    } else {
      setSelectedCustomerForReceipt(undefined);
    }
    setIsReceiptDialogOpen(true);
  };

  const handleRefundSale = (sale: Sale) => {
    setSelectedSaleForRefund(sale);
    setIsRefundDialogOpen(true);
  };

  const handleConfirmRefund = (refundItems: SaleItem[], refundTotal: number) => {
    if (!selectedSaleForRefund) return;

    const newRefundTransaction: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: refundItems.map(item => ({ ...item, quantity: -item.quantity })), // Negative quantities for refund
      subtotal: -refundTotal, // Negative subtotal
      tax: -(selectedSaleForRefund.tax / selectedSaleForRefund.subtotal) * refundTotal, // Proportionate tax
      total: -refundTotal, // Negative total
      status: "completed", // Refund is a completed transaction
      type: "refund", // Set type to "refund"
      originalSaleId: selectedSaleForRefund.id,
      customerId: selectedSaleForRefund.customerId,
      customerName: selectedSaleForRefund.customerName,
      discountPercentage: selectedSaleForRefund.discountPercentage,
      discountAmount: selectedSaleForRefund.discountAmount,
    };

    refundSale(newRefundTransaction); // Add the refund transaction to sales history

    // Increase product stock for refunded items
    refundItems.forEach(item => {
      increaseProductStock(item.productId, item.quantity);
    });

    toast.success(`Refund processed for Sale ID: ${selectedSaleForRefund.id.substring(0, 8)}. Total: ${formatCurrency(refundTotal, currentCurrency)}`);
    setIsRefundDialogOpen(false);
    setSelectedSaleForRefund(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Input
              placeholder="Search by Sale ID or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm flex-1"
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange as { from: Date; to?: Date }}
                  onSelect={setDateRange as any}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* New Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortKey} onValueChange={(value: keyof Sale) => setSortKey(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="total">Total Amount</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SalesTable sales={filteredAndSortedSales} onViewReceipt={handleViewReceipt} onRefundSale={handleRefundSale} />
        </CardContent>
      </Card>

      {selectedSaleForReceipt && (
        <ReceiptPreviewDialog
          isOpen={isReceiptDialogOpen}
          onClose={() => setIsReceiptDialogOpen(false)}
          sale={selectedSaleForReceipt}
          customer={selectedCustomerForReceipt}
        />
      )}

      {selectedSaleForRefund && (
        <RefundDialog
          isOpen={isRefundDialogOpen}
          onClose={() => setIsRefundDialogOpen(false)}
          sale={selectedSaleForRefund}
          onRefundConfirm={handleConfirmRefund}
        />
      )}
    </div>
  );
};

export default SalesHistory;