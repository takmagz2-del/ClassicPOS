"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Stores = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Multi-Store Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Stores Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This is the Multi-Store Management page. Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stores;