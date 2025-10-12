"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageTitle } from "@/hooks/use-page-title";
import CurrencySelector from "@/components/common/CurrencySelector"; // New import

const Header = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const pageTitle = usePageTitle();

  const handleLinkClick = () => {
    if (isMobile) {
      setIsSheetOpen(false);
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
            <Sidebar onLinkClick={handleLinkClick} />
          </SheetContent>
        </Sheet>
      )}
      {/* Always display the page title in the header */}
      <h1 className="text-xl font-semibold ml-auto md:ml-0">{pageTitle}</h1>
      <div className="ml-auto flex items-center gap-2"> {/* Added a div to group items on the right */}
        <CurrencySelector /> {/* Integrated CurrencySelector */}
      </div>
    </header>
  );
};

export default Header;