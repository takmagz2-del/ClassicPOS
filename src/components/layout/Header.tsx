"use client";

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Corrected import statement
import { useAuth } from "@/components/auth/AuthContext";
import { useSales } from "@/context/SaleContext";
import { useProducts } from "@/context/ProductContext";
import { useCustomers } from "@/context/CustomerContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { usePageTitle } from "@/hooks/use-page-title"; // Import usePageTitle
import { DollarSign, TrendingUp, Users, Boxes, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/layout/Sidebar";
import CurrencySelector from "@/components/common/CurrencySelector";
import UserNav from "@/components/layout/UserNav"; // Import UserNav

const Header = () => {
  const { salesHistory } = useSales();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { currentCurrency } = useCurrency();
  const pageTitle = usePageTitle(); // Use the hook to get the current page title

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [salesToday, setSalesToday] = useState<number>(0);
  const [productsInStock, setProductsInStock] = useState<number>(0);
  const [activeCustomersCount, setActiveCustomersCount] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  useEffect(() => {
    // Calculate Total Revenue
    const revenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    setTotalRevenue(revenue);

    // Calculate Sales Today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const salesForToday = salesHistory.filter(sale => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    }).reduce((sum, sale) => sum + sale.total, 0);
    setSalesToday(salesForToday);

    // Calculate Products in Stock
    const stock = products.reduce((sum, product) => sum + product.stock, 0);
    setProductsInStock(stock);

    // Set Active Customers Count
    setActiveCustomersCount(customers.length);

  }, [salesHistory, products, customers]);

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6 z-10">
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      <h1 className="text-xl font-semibold">{pageTitle}</h1> {/* Display dynamic page title */}
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <CurrencySelector />
        <UserNav />
      </div>
    </header>
  );
};

export default Header; // Corrected default export