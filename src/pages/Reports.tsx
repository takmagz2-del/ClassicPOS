"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TrendingUp, Percent } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/context/ProductContext";
import { useCategories } from "@/context/CategoryContext";
import { usePaymentMethods } from "@/context/PaymentMethodContext";
import { useAuth } from "@/components/auth/AuthContext"; // Import useAuth

const Reports = () => {
  const { salesHistory } = useSales();
  const { products } = useProducts();
  const { getCategoryName } = useCategories();
  const { currentCurrency } = useCurrency();
  const { getPaymentMethodName } = usePaymentMethods();
  const { users } = useAuth(); // Get all users for employee filter

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all"); // New state for employee filter

  const {
    totalRevenue,
    netProfit,
    profitMargin,
    averageSaleValue,
    dailySalesData,
    productCategorySales,
    topSellingProducts,
    salesByPaymentMethod,
    totalLoyaltyPointsRedeemed, // New: total loyalty points redeemed
  } = useMemo(() => {
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

    if (typeFilter !== "all") {
      filteredTransactions = filteredTransactions.filter((transaction) => transaction.type === typeFilter);
    }

    // Apply employee filter
    if (employeeFilter !== "all") {
      filteredTransactions = filteredTransactions.filter((transaction) => transaction.employeeId === employeeFilter);
    }

    const totalRev = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
    
    // Calculate total loyalty points redeemed
    const loyaltyPointsRedeemed = filteredTransactions.reduce((sum, transaction) => sum + (transaction.loyaltyPointsDiscountAmount || 0), 0);

    const totalCOGS = filteredTransactions.reduce((sum, transaction) => {
      const transactionCost = transaction.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0);
      return sum + transactionCost;
    }, 0);
    
    const profit = totalRev - totalCOGS; // Profit is calculated from total revenue after all discounts
    const margin = totalRev > 0 ? (profit / totalRev) * 100 : 0;

    const actualSales = filteredTransactions.filter(t => t.type === "sale");
    const average = actualSales.length > 0 ? actualSales.reduce((sum, sale) => sum + sale.total, 0) / actualSales.length : 0;

    const dailySalesMap = new Map<string, { sales: number; profit: number }>();
    filteredTransactions.forEach((transaction) => {
      const day = format(new Date(transaction.date), "yyyy-MM-dd");
      const existing = dailySalesMap.get(day) || { sales: 0, profit: 0 };
      const transactionCost = transaction.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0);
      const transactionProfit = transaction.total - transactionCost;

      dailySalesMap.set(day, {
        sales: existing.sales + transaction.total,
        profit: existing.profit + transactionProfit,
      });
    });

    const sortedDailySales = Array.from(dailySalesMap.entries())
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, data]) => ({
        date: format(new Date(date), "MMM dd"),
        sales: data.sales,
        profit: data.profit,
      }));

    const categorySalesMap = new Map<string, number>();
    const productSalesCountMap = new Map<string, number>();

    filteredTransactions.filter(t => t.type === "sale").forEach(sale => {
      sale.items.forEach(item => {
        const productDetails = products.find(p => p.id === item.productId);
        if (productDetails) {
          const category = getCategoryName(productDetails.categoryId) || "Uncategorized";
          categorySalesMap.set(category, (categorySalesMap.get(category) || 0) + (item.price * item.quantity));
          productSalesCountMap.set(productDetails.name, (productSalesCountMap.get(productDetails.name) || 0) + item.quantity);
        }
      });
    });

    const productCategorySales = Array.from(categorySalesMap.entries())
      .map(([category, amount]) => ({ category, sales: amount }))
      .sort((a, b) => b.sales - a.sales);

    const topSellingProducts = Array.from(productSalesCountMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const salesByPaymentMethodMap = new Map<string, number>();
    filteredTransactions.filter(t => t.type === "sale").forEach(sale => {
      const method = sale.paymentMethodId ? getPaymentMethodName(sale.paymentMethodId) : "Unknown";
      salesByPaymentMethodMap.set(method, (salesByPaymentMethodMap.get(method) || 0) + sale.total);
    });

    const salesByPaymentMethod = Array.from(salesByPaymentMethodMap.entries())
      .map(([method, amount]) => ({ method, sales: amount }))
      .sort((a, b) => b.sales - a.sales);

    return {
      totalRevenue: totalRev,
      netProfit: profit,
      profitMargin: margin,
      averageSaleValue: average,
      dailySalesData: sortedDailySales,
      productCategorySales,
      topSellingProducts,
      salesByPaymentMethod,
      totalLoyaltyPointsRedeemed: loyaltyPointsRedeemed, // Return new value
    };
  }, [salesHistory, dateRange, typeFilter, employeeFilter, products, getCategoryName, getPaymentMethodName, users]);

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

        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {users.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.email} ({employee.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">Total sales minus refunds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netProfit, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">Net revenue minus cost of goods</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Net profit as a percentage of revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSaleValue, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">Average per completed sale</p>
          </CardContent>
        </Card>
      </div>

      {totalLoyaltyPointsRedeemed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Points Redeemed</CardTitle>
            <CardDescription>
              Total value of loyalty points used as discounts in the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              -{formatCurrency(totalLoyaltyPointsRedeemed, currentCurrency)}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue & Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {dailySalesData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySalesData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value, currentCurrency)} />
                  <Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value, currentCurrency)}`, name.charAt(0).toUpperCase() + name.slice(1)]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="Revenue"
                    stroke="hsl(var(--primary))"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="hsl(var(--destructive))"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No sales or refund data for the selected period.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {productCategorySales.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productCategorySales}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(value) => formatCurrency(value, currentCurrency)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value, currentCurrency)} />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No product sales by category for the selected period.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Selling Products (by Quantity)</CardTitle>
          </CardHeader>
          <CardContent>
            {topSellingProducts.length > 0 ? (
              <div className="space-y-2">
                {topSellingProducts.map((product, index) => (
                  <div key={product.name} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                    <p className="font-medium">{index + 1}. {product.name}</p>
                    <span className="text-muted-foreground">{product.quantity} units</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No top selling products for the selected period.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {salesByPaymentMethod.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesByPaymentMethod}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis tickFormatter={(value) => formatCurrency(value, currentCurrency)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value, currentCurrency)} />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No sales by payment method for the selected period.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;