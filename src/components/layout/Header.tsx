"use client";

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Corrected import statement
// Removed useAuth, useSales, useProducts, useCustomers, useCurrency as they are no longer used in Header
// Removed formatCurrency as it is no longer used in Header
import { usePageTitle } from "@/hooks/use-page-title"; // Import usePageTitle
import { Menu } from "lucide-react"; // Removed DollarSign, TrendingUp, Users, Boxes as they are no longer used in Header
import { Button } from "@/components/ui/button";
// Removed Card, CardContent, CardHeader, CardTitle as they are no longer used in Header
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/layout/Sidebar";
import CurrencySelector from "@/components/common/CurrencySelector";
import UserNav from "@/components/layout/UserNav"; // Import UserNav

const Header = () => {
  const pageTitle = usePageTitle(); // Use the hook to get the current page title
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

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

export default Header;