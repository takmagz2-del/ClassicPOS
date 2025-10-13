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
import { LoadingProvider } from "@/context/LoadingContext";
import { PaymentMethodProvider } from "@/context/PaymentMethodContext";
import { StoreProvider } from "@/context/StoreContext";
import { SupplierProvider } from "@/context/SupplierContext";
import { InventoryHistoryProvider } from "@/context/InventoryHistoryContext"; // New import
import { PurchaseOrderProvider } from "@/context/PurchaseOrderContext"; // New import
import { GRNProvider } from "@/context/GRNContext"; // New import
import { StockAdjustmentProvider } from "@/context/StockAdjustmentContext"; // New import
import { TransferOfGoodsProvider } from "@/context/TransferOfGoodsContext"; // New import
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { routesConfig } from "@/config/routesConfig";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import GlobalLoader from "@/components/common/GlobalLoader";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

function App() {
  const LoginRoute = routesConfig.find(r => r.path === "/login");
  const LoginComponent = LoginRoute?.component;

  const SignupRoute = routesConfig.find(r => r.path === "/signup");
  const SignupComponent = SignupRoute?.component;

  return (
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LoadingProvider>
          <AuthProvider>
            <StoreProvider>
              <SupplierProvider>
                <CategoryProvider>
                  <ProductProvider> {/* ProductProvider needs InventoryHistoryProvider */}
                    <CustomerProvider>
                      <SaleProvider>
                        <CurrencyProvider>
                          <ReceiptSettingsProvider>
                            <PrinterSettingsProvider>
                              <TaxProvider>
                                <PaymentMethodProvider>
                                  <InventoryHistoryProvider> {/* New Provider */}
                                    <PurchaseOrderProvider> {/* New Provider */}
                                      <GRNProvider> {/* New Provider */}
                                        <StockAdjustmentProvider> {/* New Provider */}
                                          <TransferOfGoodsProvider> {/* New Provider */}
                                            <Toaster richColors position="top-right" />
                                            <GlobalLoader />
                                            <Routes>
                                              <Route path="/login" element={LoginComponent && <LoginComponent />} />
                                              <Route path="/signup" element={SignupComponent && <SignupComponent />} />

                                              <Route path="/" element={<ProtectedRoute />}>
                                                {routesConfig.map((route) => {
                                                  if (route.path === "/login" || route.path === "/signup") {
                                                    return null;
                                                  }
                                                  const Component = route.component;
                                                  // Adjust path for parameterized routes
                                                  const path = route.path.startsWith("/") ? route.path.substring(1) : route.path;
                                                  return (
                                                    <Route
                                                      key={route.path}
                                                      path={path}
                                                      index={route.path === "/"}
                                                      element={<Component />}
                                                    />
                                                  );
                                                })}
                                              </Route>
                                              <Route path="*" element={<NotFound />} />
                                            </Routes>
                                          </TransferOfGoodsProvider>
                                        </StockAdjustmentProvider>
                                      </GRNProvider>
                                    </PurchaseOrderProvider>
                                  </InventoryHistoryProvider>
                                </PaymentMethodProvider>
                              </TaxProvider>
                            </PrinterSettingsProvider>
                          </ReceiptSettingsProvider>
                        </CurrencyProvider>
                      </SaleProvider>
                    </CustomerProvider>
                  </ProductProvider>
                </CategoryProvider>
              </SupplierProvider>
            </StoreProvider>
          </AuthProvider>
        </LoadingProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;