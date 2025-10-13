"use client";

import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Sales from "@/pages/Sales";
import SalesHistory from "@/pages/SalesHistory";
import Stores from "@/pages/Stores";
import Suppliers from "@/pages/Suppliers"; // New import
import Accounting from "@/pages/Accounting";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import { UserRole } from "@/types/user";

export const routesConfig = [
  { path: "/", title: "Dashboard", component: Dashboard, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: "/products", title: "Products", component: Products, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: "/customers", title: "Customers", component: Customers, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/customers/:id", title: "Customer Details", component: CustomerDetail, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/suppliers", title: "Suppliers", component: Suppliers, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] }, // New route
  { path: "/sales", title: "New Sale", component: Sales, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/sales-history", title: "Sales History", component: SalesHistory, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/stores", title: "Multi-Store", component: Stores, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: "/accounting", title: "Accounting", component: Accounting, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: "/reports", title: "Reports", component: Reports, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: "/settings", title: "Settings", component: Settings, requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: "/login", title: "Login", component: Login },
  { path: "/signup", title: "Sign Up", component: Signup },
];