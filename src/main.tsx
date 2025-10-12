import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
// Removed Toaster import

createRoot(document.getElementById("root")!).render(
  // Removed Toaster component
  <App />
);