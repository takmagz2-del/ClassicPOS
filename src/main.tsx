import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster richColors position="top-right" /> {/* Render Toaster here */}
  </>
);