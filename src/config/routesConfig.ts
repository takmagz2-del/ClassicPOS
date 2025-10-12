"use client";

import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Sales from "@/pages/Sales";
import SalesHistory from "@/pages/SalesHistory";
import Stores from "@/pages/Stores";
import Accounting from "@/pages/Accounting";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import { UserRole } from "@/types/user"; // Import UserRole

export const routesConfig = [
  { path: "/", title: "Dashboard", component: Dashboard, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/products", title: "Products", component: Products, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/customers", title: "Customers", component: Customers, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/sales", title: "New Sale", component: Sales, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/sales-history", title: "Sales History", component: SalesHistory, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/stores", title: "Multi-Store", component: Stores, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: "/accounting", title: "Accounting", component: Accounting, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: "/reports", title: "Reports", component: Reports, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: "/settings", title: "Settings", component: Settings, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] }, // All roles can access settings, but some sections might be restricted
  { path: "/login", title: "Login", component: Login },
  { path: "/signup", title: "Sign Up", component: Signup },
];