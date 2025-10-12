"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { routesConfig } from "@/config/routesConfig";
import BrandLogo from "@/components/layout/BrandLogo"; // Import BrandLogo

const Header = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const location = useLocation();

  const handleLinkClick = () => {
    if (isMobile) {
      setIsSheetOpen(false);
    }
  };

  // Function to get page title based on path from routesConfig
  const getPageTitle = (pathname: string) => {
    const route = routesConfig.find(r => r.path === pathname);
    return route ? route.title : "ClassicPOS"; // Default title if route not found
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
            <Sidebar onLinkClick={handleLinkClick} />
          </SheetContent>
        </Sheet>
      )}
      {/* Display branding on mobile when sheet is closed, otherwise display page title */}
      {isMobile && !isSheetOpen ? (
        <BrandLogo />
      ) : (
        <h1 className="text-xl font-semibold ml-auto md:ml-0">{getPageTitle(location.pathname)}</h1>
      )}
    </header>
  );
};

export default Header;