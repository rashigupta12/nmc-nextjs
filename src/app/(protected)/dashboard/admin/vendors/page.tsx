// src/app/(protected)/dashboard/admin/vendors/page.tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { VendorList } from "@/components/admin/vendor/VendorList";
import { VendorForm } from "@/components/admin/vendor/VendorForm";

export default function VendorsManagementPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage business partners
          </p>
        </div>
        <Button onClick={() => setActiveTab("create")}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Vendor
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">All Vendors</TabsTrigger>
          <TabsTrigger value="create">Create Vendor</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <VendorList />
        </TabsContent>

        <TabsContent value="create">
          <Card className="p-6">
            <VendorForm onSuccess={() => setActiveTab("list")} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}