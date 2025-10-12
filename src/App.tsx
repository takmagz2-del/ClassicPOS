"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { SaleProvider } from "@/context/SaleContext";
import { ProductProvider } from "@/context/ProductContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ReceiptSettingsProvider } from "@/context/ReceiptSettingsContext";
import { PrinterSettingsProvider } from "@/context/PrinterSettingsContext";
import { TaxProvider } from "@/context/TaxContext";
import { CategoryProvider } from "@/context/CategoryContext";
import { LoadingProvider } from "@/context/LoadingContext"; // New import
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { routesConfig } from "@/config/routesConfig";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import GlobalLoader from "@/components/common/GlobalLoader"; // New import

function App() {
  const LoginRoute = routesConfig.find(r => r.path === "/login");
  const LoginComponent = LoginRoute?.component;

  const SignupRoute = routesConfig.find(r => r.path === "/signup");
  const SignupComponent = SignupRoute?.component;

  return (
    <BrowserRouter>
      <LoadingProvider> {/* Wrap with LoadingProvider */}
        <AuthProvider>
          <CategoryProvider>
            <ProductProvider>
              <CustomerProvider>
                <SaleProvider>
                  <CurrencyProvider>
                    <ReceiptSettingsProvider>
                      <PrinterSettingsProvider>
                        <TaxProvider>
                          <Toaster richColors position="top-right" />
                          <GlobalLoader /> {/* Add GlobalLoader here */}
                          <Routes>
                            <Route path="/login" element={LoginComponent && <LoginComponent />} />
                            <Route path="/signup" element={SignupComponent && <SignupComponent />} />

                            <Route path="/" element={<ProtectedRoute />}>
                              {routesConfig.map((route) => {
                                if (route.path === "/login" || route.path === "/signup") {
                                  return null; // These are handled outside ProtectedRoute
                                }
                                const Component = route.component;
                                return (
                                  <Route
                                    key={route.path}
                                    path={route.path === "/" ? "" : route.path.substring(1)}
                                    index={route.path === "/"}
                                    element={<Component />}
                                  />
                                );
                              })}
                            </Route>
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </TaxProvider>
                      </PrinterSettingsProvider>
                    </ReceiptSettingsProvider>
                  </CurrencyProvider>
                </SaleProvider>
              </CustomerProvider>
            </ProductProvider>
          </CategoryProvider>
        </AuthProvider>
      </LoadingProvider>
    </BrowserRouter>
  );
}

export default App;