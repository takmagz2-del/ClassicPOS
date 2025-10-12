"use client";

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package2, Home, ShoppingCart, Users, LineChart, Settings, Boxes, CreditCard, Store, DollarSign, History } from "lucide-react"; // Added History icon

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onLinkClick?: () => void;
}

const Sidebar = ({ className, onLinkClick }: SidebarProps) => {
  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/products", icon: Boxes, label: "Products" },
    { to: "/customers", icon: Users, label: "Customers" },
    { to: "/sales", icon: ShoppingCart, label: "Sales Terminal" }, // Renamed for clarity
    { to: "/sales-history", icon: History, label: "Sales History" }, // Added Sales History link
    { to: "/stores", icon: Store, label: "Multi-Store" },
    { to: "/accounting", icon: DollarSign, label: "Accounting" },
    { to: "/reports", icon: LineChart, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            ClassicPOS
          </h2>
          <ScrollArea className="h-[calc(100vh-120px)]">
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