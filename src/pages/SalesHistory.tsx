"use client";

import React from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/context/SaleContext"; // Ensure this uses the alias
import SalesTable from "@/components/sales/SalesTable";

const SalesHistory = () => {
  const { logout } = useAuth();
  const { salesHistory } = useSales();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales History</h1>
        <Button onClick={logout} variant="destructive">
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable sales={salesHistory} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesHistory;