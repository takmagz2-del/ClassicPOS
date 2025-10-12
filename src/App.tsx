"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { SaleProvider } from "@/context/SaleContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "@/pages/Login";
import Sales from "@/pages/Sales";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import SalesHistory from "@/pages/SalesHistory";
import Stores from "@/pages/Stores";
import Accounting from "@/pages/Accounting";
import Index from "@/pages/Index";
import { routesConfig } from "@/config/routesConfig"; // Import routesConfig

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SaleProvider>
          <Routes>
            {/* Public route for login */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute />}>
              {/* Dynamically render routes from config */}
              {routesConfig.map((route) => {
                // Special handling for the index route
                if (route.path === "/") {
                  return <Route key={route.path} index element={<Index />} />;
                }
                // Map other routes to their respective components
                let element;
                switch (route.path) {
                  case "/products": element = <Products />; break;
                  case "/customers": element = <Customers />; break;
                  case "/sales": element = <Sales />; break;
                  case "/sales-history": element = <SalesHistory />; break;
                  case "/stores": element = <Stores />; break;
                  case "/accounting": element = <Accounting />; break;
                  case "/reports": element = <Reports />; break;
                  case "/settings": element = <Settings />; break;
                  default: element = null;
                }
                return element ? <Route key={route.path} path={route.path.substring(1)} element={element} /> : null;
              })}
            </Route>
          </Routes>
        </SaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;