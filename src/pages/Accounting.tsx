"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Accounting = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Accounting</h1>
      <Card>
        <CardHeader>
          <CardTitle>Accounting Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This is the Accounting page. Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounting;