"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthContext";
import { SaleProvider } from "@/context/SaleContext"; // Corrected import path
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "@/pages/Login";
import Sales from "@/pages/Sales";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Reports from "@/pages/Reports"; // Added import for Reports
import Settings from "@/pages/Settings"; // Added import for Settings
import MainLayout from "@/components/layout/MainLayout"; // Corrected import name

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