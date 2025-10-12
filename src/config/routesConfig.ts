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

export const routesConfig = [
  { path: "/", title: "Dashboard", component: Dashboard }, // Dashboard is now the root
  { path: "/products", title: "Products", component: Products },
  { path: "/customers", title: "Customers", component: Customers },
  { path: "/sales", title: "New Sale", component: Sales },
  { path: "/sales-history", title: "Sales History", component: SalesHistory },
  { path: "/stores", title: "Multi-Store", component: Stores },
  { path: "/accounting", title: "Accounting", component: Accounting },
  { path: "/reports", title: "Reports", component: Reports },
  { path: "/settings", title: "Settings", component: Settings },
  { path: "/login", title: "Login", component: Login },
  { path: "/signup", title: "Sign Up", component: Signup },
];