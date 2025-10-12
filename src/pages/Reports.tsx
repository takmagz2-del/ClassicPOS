"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Reports Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This is the Reports page. Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;