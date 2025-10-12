"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSales } from "@/context/SaleContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, DollarSign, TrendingDown, ShoppingBag, ChevronsRight, BarChart } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay, isWithinInterval, subDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

const Accounting = () => {
  const { salesHistory } = useSales();
  const { currentCurrency } = useCurrency();

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const financialSummary = useMemo(() => {
    const transactions = salesHistory.filter((sale) => {
      if (!dateRange.from || !dateRange.to) return true;
      const saleDate = new Date(sale.date);
      return isWithinInterval(saleDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      });
    });

    const sales = transactions.filter(t => t.type === 'sale');
    const refunds = transactions.filter(t => t.type === 'refund');

    const grossSales = sales.reduce((sum, sale) => sum + sale.subtotal, 0);
    const discounts = sales.reduce((sum, sale) => sum + (sale.discountAmount || 0) + (sale.loyaltyPointsUsed ? sale.loyaltyPointsUsed / 100 : 0), 0);
    const totalRefunds = refunds.reduce((sum, refund) => sum + Math.abs(refund.total), 0);
    
    const netSales = grossSales - discounts - totalRefunds;

    const cogs = transactions.reduce((sum, transaction) => {
      const transactionCost = transaction.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0);
      return sum + transactionCost; // item.quantity is negative for refunds, so it correctly subtracts cost
    }, 0);

    const taxesCollected = transactions.reduce((sum, transaction) => sum + transaction.tax, 0);
    const grossProfit = netSales - cogs;

    return {
      grossSales,
      discounts,
      totalRefunds,
      netSales,
      cogs,
      taxesCollected,
      grossProfit,
    };
  }, [salesHistory, dateRange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounting</h1>
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
          <PopoverContent className="w-auto p-0" align="end">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.netSales, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">After discounts and refunds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.grossProfit, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">Net Sales minus Cost of Goods</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost of Goods Sold</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.cogs, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">Total cost of items sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxes Collected</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.taxesCollected, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">Total taxes from sales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>
            A detailed breakdown of your sales, costs, and profits for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Metric</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Gross Sales</TableCell>
                <TableCell className="text-right">{formatCurrency(financialSummary.grossSales, currentCurrency)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-muted-foreground">Discounts</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">-{formatCurrency(financialSummary.discounts, currentCurrency)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-muted-foreground">Refunds</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">-{formatCurrency(financialSummary.totalRefunds, currentCurrency)}</TableCell>
              </TableRow>
              <TableRow className="font-semibold">
                <TableCell>Net Sales</TableCell>
                <TableCell className="text-right">{formatCurrency(financialSummary.netSales, currentCurrency)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cost of Goods Sold (COGS)</TableCell>
                <TableCell className="text-right">-{formatCurrency(financialSummary.cogs, currentCurrency)}</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow className="text-lg font-bold">
                <TableCell>Gross Profit</TableCell>
                <TableCell className="text-right">{formatCurrency(financialSummary.grossProfit, currentCurrency)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounting;