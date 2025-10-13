"use client";

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, ShoppingCart, Users, LineChart, Settings, Boxes, Store, DollarSign, History } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import { useAuth } from "@/components/auth/AuthContext"; // New import
import { UserRole } from "@/types/user"; // New import

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onLinkClick?: () => void;
}

const Sidebar = ({ className, onLinkClick }: SidebarProps) => {
  const { user, hasPermission } = useAuth(); // Use user and hasPermission from AuthContext

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard", requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
    { to: "/products", icon: Boxes, label: "Products", requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
    { to: "/customers", icon: Users, label: "Customers", requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
    { to: "/sales", icon: ShoppingCart, label: "Sales Terminal", requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
    { to: "/sales-history", icon: History, label: "Sales History", requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
    { to: "/stores", icon: Store, label: "Multi-Store", requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
    { to: "/accounting", icon: DollarSign, label: "Accounting", requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
    { to: "/reports", icon: LineChart, label: "Reports", requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
    { to: "/settings", icon: Settings, label: "Settings", requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
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
                // Only render if the user has the required permission
                (item.requiredRoles && hasPermission(item.requiredRoles)) && (
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
                )
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;