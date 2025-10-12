"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const location = useLocation();

  const handleLinkClick = () => {
    if (isMobile) {
      setIsSheetOpen(false);
    }
  };

  // Function to get page title based on path
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/":
        return "Dashboard";
      case "/products":
        return "Products";
      case "/customers":
        return "Customers";
      case "/sales":
        return "Sales Terminal";
      case "/sales-history": // Added new case for Sales History
        return "Sales History";
      case "/stores":
        return "Multi-Store";
      case "/accounting":
        return "Accounting";
      case "/reports":
        return "Reports";
      case "/settings":
        return "Settings";
      default:
        return "ClassicPOS";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs p-0">
            <nav className="grid gap-6 text-lg font-medium pt-6">
              <Link
                to="/"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                onClick={handleLinkClick}
              >
                <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">ClassicPOS</span>
              </Link>
              <Sidebar onLinkClick={handleLinkClick} />
            </nav>
          </SheetContent>
        </Sheet>
      )}
      <Link
        to="/"
        className="hidden sm:flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <Package2 className="h-6 w-6" />
        <span className="sr-only">ClassicPOS</span>
      </Link>
      <h1 className="text-xl font-semibold ml-auto">{getPageTitle(location.pathname)}</h1>
    </header>
  );
};

export default Header;