"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/context/SaleContext";
import { useProducts } from "@/context/ProductContext";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { useCustomers } from "@/context/CustomerContext";
import { format, startOfDay, endOfDay, isWithinInterval, subDays, eachDayOfInterval } from "date-fns";
import { DollarSign, TrendingUp, Users, Boxes } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import LowStockProducts from "@/components/dashboard/LowStockProducts";
import TopCustomers from "@/components/dashboard/TopCustomers";
import CategorySalesChart from "@/components/dashboard/CategorySalesChart";
import RecentSales from "@/components/dashboard/RecentSales";
import QuickActionsToolbar from "@/components/dashboard/QuickActionsToolbar"; // Import the new component

const Dashboard = () => {
  const { salesHistory } = useSales();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { currentCurrency } = useCurrency();

  const [revenueLast30Days, setRevenueLast30Days] = useState<number>(0);
  const [salesToday, setSalesToday] = useState<number>(0);
  const [productsInStock, setProductsInStock] = useState<number>(0);
  const [activeCustomersCount, setActiveCustomersCount] = useState<number>(0);
  const [revenueChange, setRevenueChange] = useState<string>("");
  const [salesTodayChange, setSalesTodayChange] = useState<string>("");
  const [salesOverviewData, setSalesOverviewData] = useState<{ date: string; sales: number }[]>([]);

  useEffect(() => {
    const now = new Date();

    // --- Revenue (Last 30 Days vs. Previous 30 Days) ---
    const currentPeriodStart = startOfDay(subDays(now, 29));
    const previousPeriodStart = startOfDay(subDays(now, 59));
    const previousPeriodEnd = endOfDay(subDays(now, 30));

    const revenueCurrentPeriod = salesHistory
      .filter(sale => new Date(sale.date) >= currentPeriodStart)
      .reduce((sum, sale) => sum + sale.total, 0);
    setRevenueLast30Days(revenueCurrentPeriod);

    const revenuePreviousPeriod = salesHistory
      .filter(sale => isWithinInterval(new Date(sale.date), { start: previousPeriodStart, end: previousPeriodEnd }))
      .reduce((sum, sale) => sum + sale.total, 0);

    if (revenuePreviousPeriod !== 0) {
      const change = ((revenueCurrentPeriod - revenuePreviousPeriod) / revenuePreviousPeriod) * 100;
      setRevenueChange(`${change >= 0 ? "+" : ""}${change.toFixed(1)}% from previous 30 days`);
    } else if (revenueCurrentPeriod > 0) {
      setRevenueChange("New sales activity");
    } else {
      setRevenueChange("No change from previous 30 days");
    }

    // --- Sales Today (vs. Yesterday) ---
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));
    const yesterdayEnd = endOfDay(subDays(now, 1));

    const calculatedSalesToday = salesHistory
      .filter(sale => new Date(sale.date) >= todayStart)
      .reduce((sum, sale) => sum + sale.total, 0);
    setSalesToday(calculatedSalesToday);

    const salesYesterday = salesHistory
      .filter(sale => isWithinInterval(new Date(sale.date), { start: yesterdayStart, end: yesterdayEnd }))
      .reduce((sum, sale) => sum + sale.total, 0);

    if (salesYesterday !== 0) {
      const change = ((calculatedSalesToday - salesYesterday) / salesYesterday) * 100;
      setSalesTodayChange(`${change >= 0 ? "+" : ""}${change.toFixed(1)}% from yesterday`);
    } else if (calculatedSalesToday > 0) {
      setSalesTodayChange("Up from zero yesterday");
    } else {
      setSalesTodayChange("No sales yesterday or today");
    }

    // --- Snapshot KPIs (no percentage change) ---
    const stock = products.reduce((sum, product) => sum + product.stock, 0);
    setProductsInStock(stock);
    setActiveCustomersCount(customers.length);

    // --- Sales Overview Chart (Last 30 Days) ---
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

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Last 30 Days)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueLast30Days, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">{revenueChange}</p>
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
            <p className="text-xs text-muted-foreground">Total registered customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsInStock}</div>
            <p className="text-xs text-muted-foreground">Total units across all products</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
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

        <div className="lg:col-span-3">
          <RecentSales />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TopCustomers />
        <LowStockProducts products={products} />
        <CategorySalesChart />
      </div>
    </div>
  );
};

export default Dashboard;