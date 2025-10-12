"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
// Removed Toaster import as it's now in main.tsx
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

function App() {
  return (
    <BrowserRouter>
      {/* Toaster is now rendered in main.tsx */}
      <AuthProvider>
        <SaleProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {/* MainLayout is now rendered inside ProtectedRoute */}
                </ProtectedRoute>
              }
            >
              <Route index element={<Index />} />
              <Route path="products" element={<Products />} />
              <Route path="customers" element={<Customers />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales-history" element={<SalesHistory />} />
              <Route path="stores" element={<Stores />} />
              <Route path="accounting" element={<Accounting />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </SaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;