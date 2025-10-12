"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { SaleProvider } from "@/context/SaleContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { routesConfig } from "@/config/routesConfig"; // Import routesConfig

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
                      path={route.path === "/" ? undefined : route.path.substring(1)} // `index` for "/", `path` for others
                      index={route.path === "/"}
                      element={<Component />}
                    />
                  );
                }
                return null;
              })}
            </Route>
          </Routes>
        </SaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;