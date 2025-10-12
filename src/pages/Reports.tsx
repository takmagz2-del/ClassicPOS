"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/context/SaleContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const Reports = () => {
  const { salesHistory } = useSales();
  const { currentCurrency } = useCurrency();

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default to last month
    to: new Date(),
  });

  const { totalRevenue, averageSaleValue, dailySalesData } = useMemo(() => {
    let filteredTransactions = salesHistory;

    if (dateRange.from && dateRange.to) {
      filteredTransactions = salesHistory.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return isWithinInterval(transactionDate, {
          start: startOfDay(dateRange.from!),
          end: endOfDay(dateRange.to!),
        });
      });
    } else if (dateRange.from) {
      filteredTransactions = salesHistory.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startOfDay(dateRange.from!);
      });
    } else if (dateRange.to) {
      filteredTransactions = salesHistory.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate <= endOfDay(dateRange.to!);
      });
    }

    // Calculate total revenue by summing up all transaction totals (refunds will be negative)
    const total = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);

    // For average sale value, we only consider actual sales, not refunds
    const actualSales = filteredTransactions.filter(t => t.type === "sale");
    const average = actualSales.length > 0 ? actualSales.reduce((sum, sale) => sum + sale.total, 0) / actualSales.length : 0;


    // Aggregate daily sales (including refunds as negative values)
    const dailySalesMap = new Map<string, number>();
    filteredTransactions.forEach((transaction) => {
      const day = format(new Date(transaction.date), "yyyy-MM-dd");
      dailySalesMap.set(day, (dailySalesMap.get(day) || 0) + transaction.total);
    });

    const sortedDailySales = Array.from(dailySalesMap.entries())
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, amount]) => ({
        date: format(new Date(date), "MMM dd"),
        sales: amount,
      }));

    return {
      totalRevenue: total,
      averageSaleValue: average,
      dailySalesData: sortedDailySales,
    };
  }, [salesHistory, dateRange]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Sales Reports</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">Total sales minus refunds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSaleValue, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">Average per completed sale (excluding refunds)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Sales & Refunds Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {dailySalesData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySalesData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value, currentCurrency)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currentCurrency)} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No sales or refund data for the selected period.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;