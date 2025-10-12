"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { SaleProvider } from "@/context/SaleContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { routesConfig } from "@/config/routesConfig"; // Import routesConfig
import NotFound from "@/pages/NotFound"; // Import NotFound component

function App() {
  // Find the Login component from the routesConfig
  const LoginRoute = routesConfig.find(r => r.path === "/login");
  const LoginComponent = LoginRoute?.component;

  return (
    <BrowserRouter>
      <AuthProvider>
        <SaleProvider>
          <Routes>
            {/* Public route for login */}
            <Route path="/login" element={LoginComponent ? <LoginComponent /> : null} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute />}>
              {routesConfig.map((route) => {
                // Only render protected routes here, excluding login
                if (route.path !== "/login") {
                  const Component = route.component;
                  return (
                    <Route
                      key={route.path}
                      path={route.path === "/" ? undefined : route.path.replace(/^\//, '')} // Use `index` for "/", remove leading slash for others
                      index={route.path === "/"}
                      element={<Component />}
                    />
                  );
                }
                return null;
              })}
            </Route>
            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;