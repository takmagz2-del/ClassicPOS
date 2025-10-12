"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/context/SaleContext";
import { useProducts } from "@/context/ProductContext";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { useCustomers } from "@/context/CustomerContext";
import { format } from "date-fns";
import { DollarSign, TrendingUp, Users, Boxes } from "lucide-react"; // Import icons

const Dashboard = () => {
  const { logout } = useAuth();
  const { salesHistory } = useSales();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { currentCurrency } = useCurrency();

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [salesToday, setSalesToday] = useState<number>(0);
  const [productsInStock, setProductsInStock] = useState<number>(0);
  const [activeCustomersCount, setActiveCustomersCount] = useState<number>(0);

  useEffect(() => {
    // Calculate Total Revenue (subtract refunds)
    const revenue = salesHistory.reduce((sum, sale) => {
      return sum + (sale.type === "sale" ? sale.total : sale.total); // Refunds have negative total, so just add
    }, 0);
    setTotalRevenue(revenue);

    // Calculate Sales Today (subtract refunds)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const salesForToday = salesHistory.filter(sale => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    }).reduce((sum, sale) => sum + (sale.type === "sale" ? sale.total : sale.total), 0); // Refunds have negative total
    setSalesToday(salesForToday);

    // Calculate Products in Stock
    const stock = products.reduce((sum, product) => sum + product.stock, 0);
    setProductsInStock(stock);

    // Set Active Customers Count
    setActiveCustomersCount(customers.length);

  }, [salesHistory, products, customers]);

  // Get recent sales for display (including refunds for history, but maybe filter for "sales" if desired)
  const recentSales = [...salesHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={logout} variant="destructive">
          Logout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesToday, currentCurrency)}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomersCount}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsInStock}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
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