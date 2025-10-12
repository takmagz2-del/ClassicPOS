"use client";

import React, { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom"; // Import Link
import { Package2 } from "lucide-react"; // Import Package2 icon

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {!isMobile && (
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            {/* Branding for desktop sidebar */}
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link to="/" className="flex items-center gap-2 font-semibold">
                <Package2 className="h-6 w-6" />
                <span className="">ClassicPOS</span>
              </Link>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default MainLayout;