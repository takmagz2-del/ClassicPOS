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
import { Sale } from "@/types/sale";

const SalesHistory = () => {
  const { logout } = useAuth();
  const { salesHistory } = useSales();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all", "completed", "pending", "cancelled"
  const [sortKey, setSortKey] = useState<keyof Sale>("date"); // 'date', 'total'
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // 'asc', 'desc'

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

    // 4. Sort
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
  }, [salesHistory, searchTerm, dateRange, statusFilter, sortKey, sortOrder]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales History</h1>
        <Button onClick={logout} variant="destructive">
          Logout
        </Button>
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
          <SalesTable sales={filteredAndSortedSales} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesHistory;