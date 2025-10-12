"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { SaleProvider } from "@/context/SaleContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { routesConfig } from "@/config/routesConfig";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster

function App() {
  const LoginRoute = routesConfig.find(r => r.path === "/login");
  const LoginComponent = LoginRoute?.component;

  return (
    <BrowserRouter>
      <AuthProvider>
        <SaleProvider>
          <Toaster richColors position="top-right" /> {/* Render Toaster here */}
          <Routes>
            <Route path="/login" element={LoginComponent ? <LoginComponent /> : null} />

            <Route path="/" element={<ProtectedRoute />}>
              {routesConfig.map((route) => {
                if (route.path !== "/login") {
                  const Component = route.component;
                  return (
                    <Route
                      key={route.path}
                      path={route.path === "/" ? undefined : route.path.replace(/^\//, '')}
                      index={route.path === "/"}
                      element={<Component />}
                    />
                  );
                }
                return null;
              })}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;