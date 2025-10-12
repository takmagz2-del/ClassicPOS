"use client";

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, ShoppingCart, Users, LineChart, Settings, Boxes, Store, DollarSign, History } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onLinkClick?: () => void;
}

const Sidebar = ({ className, onLinkClick }: SidebarProps) => {
  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" }, // Changed to "/"
    { to: "/products", icon: Boxes, label: "Products" },
    { to: "/customers", icon: Users, label: "Customers" },
    { to: "/sales", icon: ShoppingCart, label: "Sales Terminal" },
    { to: "/sales-history", icon: History, label: "Sales History" },
    { to: "/stores", icon: Store, label: "Multi-Store" },
    { to: "/accounting", icon: DollarSign, label: "Accounting" },
    { to: "/reports", icon: LineChart, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className={cn("flex-1 overflow-auto", className)}>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <BrandLogo />
      </div>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <ScrollArea className="h-full">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                  onClick={onLinkClick}
                >
                  <Link to={item.to}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;