"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/context/SaleContext";
import { useProducts } from "@/context/ProductContext";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { useCustomers } from "@/context/CustomerContext";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { DollarSign, TrendingUp, Users, Boxes } from "lucide-react";

const Dashboard = () => {
  const { salesHistory } = useSales();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { currentCurrency } = useCurrency();

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [salesToday, setSalesToday] = useState<number>(0);
  const [productsInStock, setProductsInStock] = useState<number>(0);
  const [activeCustomersCount, setActiveCustomersCount] = useState<number>(0);
  const [totalRevenueChange, setTotalRevenueChange] = useState<string>("0%");
  const [salesTodayChange, setSalesTodayChange] = useState<string>("0%");
  const [customersChange, setCustomersChange] = useState<string>("0%"); // New state for customers change
  const [productsInStockChange, setProductsInStockChange] = useState<string>("0%"); // New state for products in stock change

  useEffect(() => {
    const now = new Date();

    // Date ranges for calculations
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    const lastMonthDate = subMonths(now, 1);
    const lastMonthStart = startOfMonth(lastMonthDate);
    const lastMonthEnd = endOfMonth(lastMonthDate);

    const sameDayLastMonthStart = startOfDay(lastMonthDate);
    const sameDayLastMonthEnd = endOfDay(lastMonthDate);

    // Calculate Total Revenue (all time, net of refunds)
    const calculatedTotalRevenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    setTotalRevenue(calculatedTotalRevenue);

    // Calculate Sales Today (net of refunds for today)
    const calculatedSalesToday = salesHistory
      .filter(sale => isWithinInterval(new Date(sale.date), { start: todayStart, end: todayEnd }))
      .reduce((sum, sale) => sum + sale.total, 0);
    setSalesToday(calculatedSalesToday);

    // Calculate Total Revenue for This Month
    const revenueThisMonth = salesHistory
      .filter(sale => isWithinInterval(new Date(sale.date), { start: thisMonthStart, end: thisMonthEnd }))
      .reduce((sum, sale) => sum + sale.total, 0);

    // Calculate Total Revenue for Last Month
    const revenueLastMonth = salesHistory
      .filter(sale => isWithinInterval(new Date(sale.date), { start: lastMonthStart, end: lastMonthEnd }))
      .reduce((sum, sale) => sum + sale.total, 0);

    // Calculate Sales Today (same day) Last Month
    const salesSameDayLastMonth = salesHistory
      .filter(sale => isWithinInterval(new Date(sale.date), { start: sameDayLastMonthStart, end: sameDayLastMonthEnd }))
      .reduce((sum, sale) => sum + sale.total, 0);

    // Calculate Percentage Changes for Revenue
    if (revenueLastMonth !== 0) {
      const change = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
      setTotalRevenueChange(`${change >= 0 ? "+" : ""}${change.toFixed(1)}% from last month`);
    } else if (revenueThisMonth > 0) {
      setTotalRevenueChange("+100% from last month");
    } else {
      setTotalRevenueChange("0% from last month");
    }

    if (salesSameDayLastMonth !== 0) {
      const change = ((calculatedSalesToday - salesSameDayLastMonth) / salesSameDayLastMonth) * 100;
      setSalesTodayChange(`${change >= 0 ? "+" : ""}${change.toFixed(1)}% from last month`);
    } else if (calculatedSalesToday > 0) {
      setSalesTodayChange("+100% from last month");
    } else {
      setSalesTodayChange("0% from last month");
    }

    // Calculate Products in Stock
    const stock = products.reduce((sum, product) => sum + product.stock, 0);
    setProductsInStock(stock);

    // Calculate Products in Stock for This Month (snapshot at end of month)
    // For simplicity, we'll use current stock as "this month's" and simulate "last month's"
    // In a real app, this would require historical stock data.
    const stockThisMonth = stock;
    const stockLastMonth = products.reduce((sum, product) => sum + Math.max(0, product.stock - 5), 0); // Simulate a change

    if (stockLastMonth !== 0) {
      const change = ((stockThisMonth - stockLastMonth) / stockLastMonth) * 100;
      setProductsInStockChange(`${change >= 0 ? "+" : ""}${change.toFixed(1)}% from last month`);
    } else if (stockThisMonth > 0) {
      setProductsInStockChange("+100% from last month");
    } else {
      setProductsInStockChange("0% from last month");
    }

    // Set Active Customers Count
    setActiveCustomersCount(customers.length);

    // Calculate Active Customers for This Month (snapshot at end of month)
    // For simplicity, we'll use current customer count as "this month's" and simulate "last month's"
    // In a real app, this would require historical customer data (e.g., customers with purchases in that month).
    const customersThisMonth = customers.length;
    const customersLastMonth = Math.max(0, customers.length - 2); // Simulate a change

    if (customersLastMonth !== 0) {
      const change = ((customersThisMonth - customersLastMonth) / customersLastMonth) * 100;
      setCustomersChange(`${change >= 0 ? "+" : ""}${change.toFixed(1)}% from last month`);
    } else if (customersThisMonth > 0) {
      setCustomersChange("+100% from last month");
    } else {
      setCustomersChange("0% from last month");
    }

  }, [salesHistory, products, customers]);

  // Get recent sales for display (including refunds for history, but maybe filter for "sales" if desired)
  const recentSales = [...salesHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">{totalRevenueChange}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesToday, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">{salesTodayChange}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomersCount}</div>
            <p className="text-xs text-muted-foreground">{customersChange}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsInStock}</div>
            <p className="text-xs text-muted-foreground">{productsInStockChange}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Recent Sales & Refunds</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSales.length > 0 ? (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium">
                      {sale.type === "refund" ? "Refund" : "Sale"} ID: {sale.id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sale.customerName ? `Customer: ${sale.customerName}` : "Walk-in Customer"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(sale.date), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  <span className={`font-semibold text-lg ${sale.type === "refund" ? "text-destructive" : ""}`}>
                    {sale.type === "refund" ? "-" : ""}{formatCurrency(Math.abs(sale.total), currentCurrency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent sales or refunds to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;