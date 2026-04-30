/*eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/VendorList.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getVendors } from "@/actions/admin/vendor-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Settings, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function VendorList() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    try {
      const data = await getVendors();
      if (Array.isArray(data)) {
        setVendors(data);
      } else {
        console.error("Error loading vendors:", data.error);
      }
    } catch (error) {
      console.error("Error loading vendors:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleViewDetails = (vendorId: string) => {
    router.push(`/dashboard/admin/business/${vendorId}`);
  };

  const handleSettings = (vendorId: string) => {
    router.push(`/dashboard/admin/business/${vendorId}/settings`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business partners...</p>
        </div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No business partners found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Click " Add New Business Partner " to create your first business partner
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Partner Code</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor: any) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.vendorCode}</TableCell>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={vendor.status === "ACTIVE" ? "default" : "secondary"}
                    className={vendor.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(vendor.createdAt), "dd MMM yyyy")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(vendor.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettings(vendor.id)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}