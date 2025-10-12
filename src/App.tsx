"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthContext";
import { SaleProvider } from "@/context/SaleContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "@/pages/Login";
import Sales from "@/pages/Sales";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import SalesHistory from "@/pages/SalesHistory"; // Import SalesHistory
import Stores from "@/pages/Stores"; // Import Stores
import Accounting from "@/pages/Accounting"; // Import Accounting

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
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
              <Route index element={<Sales />} />
              <Route path="products" element={<Products />} />
              <Route path="customers" element={<Customers />} />
              <Route path="sales-history" element={<SalesHistory />} /> {/* Added Sales History route */}
              <Route path="stores" element={<Stores />} /> {/* Added Stores route */}
              <Route path="accounting" element={<Accounting />} /> {/* Added Accounting route */}
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