"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/context/SaleContext";
import { useProducts } from "@/context/ProductContext";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { useCustomers } from "@/context/CustomerContext";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, isWithinInterval, subDays, eachDayOfInterval } from "date-fns";
import { DollarSign, TrendingUp, Users, Boxes } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sale } from "@/types/sale";

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
  const [customersChange, setCustomersChange] = useState<string>("0%");
  const [productsInStockChange, setProductsInStockChange] = useState<string>("0%");
  const [salesOverviewData, setSalesOverviewData] = useState<{ date: string; sales: number }[]>([]);

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

    // Calculate Active Customers for This Month
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

    // Calculate Sales Overview Data for the last 30 days
    const thirtyDaysAgo = subDays(now, 29);
    const dateInterval = eachDayOfInterval({ start: thirtyDaysAgo, end: now });

    const salesByDay = dateInterval.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const total = salesHistory
        .filter(sale => isWithinInterval(new Date(sale.date), { start: dayStart, end: dayEnd }))
        .reduce((sum, sale) => sum + sale.total, 0);

      return {
        date: format(day, 'MMM dd'),
        sales: total
      };
    });
    setSalesOverviewData(salesByDay);

  }, [salesHistory, products, customers]);

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

        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {salesOverviewData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesOverviewData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
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
              <p className="text-center text-muted-foreground">No sales data to display for the last 30 days.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;