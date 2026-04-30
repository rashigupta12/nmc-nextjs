/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/admin/business/[vendorId]/page.tsx
"use client";

import { deleteVendor, getVendorById, resetVendorPassword, updateVendorStatus } from "@/actions/admin/vendor-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Copy,
  Globe,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Settings,
  Trash2,
  User,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadVendor();
  }, [vendorId]);

  async function loadVendor() {
    try {
      const result = await getVendorById(vendorId);
      if (result && "id" in result && !("error" in result)) {
        setVendor(result);
      } else if ("error" in result) {
        
        router.push("/dashboard/admin/business");
      }
    } catch (error) {
      console.error("Error loading vendor:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(status: "ACTIVE" | "SUSPENDED" | "INACTIVE") {
    const result = await updateVendorStatus(vendorId, status);
    if (result.success) {
      toast({
        title: "Success",
        description: `Vendor status updated to ${status}`,
      });
      loadVendor();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  }

  async function handleDelete() {
    const result = await deleteVendor(vendorId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
      router.push("/dashboard/admin/business");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  }

  async function handleResetPassword() {
    setResetting(true);
    try {
      const result = await resetVendorPassword(vendorId);
      if (result.success) {
        setNewPassword(result.tempPassword);
        setShowPasswordDialog(true);
        toast({
          title: "Success",
          description: "Vendor password has been reset",
        });
        loadVendor();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } finally {
      setResetting(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(newPassword);
    toast({
      title: "Copied",
      description: "Password copied to clipboard",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Vendor not found</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/admin/business")}>
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
           <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
             <Badge 
               className={`
                 ${vendor.status === "ACTIVE" ? "bg-green-100 text-green-800" : ""}
                 ${vendor.status === "SUSPENDED" ? "bg-yellow-100 text-yellow-800" : ""}
                 ${vendor.status === "INACTIVE" ? "bg-gray-100 text-gray-800" : ""}
                 px-3 py-1
               `}
             >
               {vendor.status}
             </Badge>
             <p className="text-muted-foreground mt-1">
               Vendor Code: {vendor.vendorCode}
             </p>
           </div>
        </div>
         <div className="flex gap-2">
           <Link href={`/dashboard/admin/business/${vendorId}/settings`}>
             <Button variant="outline" disabled={vendor.status !== "ACTIVE"}>
               <Settings className="h-4 w-4 mr-2" />
               Settings
             </Button>
           </Link>

           <AlertDialog>
             <AlertDialogTrigger asChild>
               <Button variant="default" disabled={vendor.status !== "ACTIVE"}>
                 <KeyRound className="h-4 w-4 mr-2" />
                 Reset Password
               </Button>
             </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Vendor Password?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new temporary password. Vendor will be forced to set a new password on their next login.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetPassword} disabled={resetting}>
                  {resetting ? "Resetting..." : "Reset Password"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Status Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange(vendor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
            className="flex items-center gap-2"
          >
            {vendor.status === "ACTIVE" ? (
              <ToggleRight className="h-6 w-6 text-green-600" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-gray-400" />
            )}
            <span>{vendor.status === "ACTIVE" ? "Active" : "Inactive"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Vendor contact details and address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{vendor.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Contact Number</p>
                  <p className="text-sm text-muted-foreground">{vendor.contactNo}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Contact Person Gender</p>
                  <p className="text-sm text-muted-foreground">
                    {vendor.gender === "M" ? "Male" : vendor.gender === "F" ? "Female" : "Other"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <p className="text-sm text-muted-foreground">
                    {vendor.website ? (
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {vendor.website}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{vendor.address}</p>
                {vendor.city && <p className="text-sm text-muted-foreground">{vendor.city}, {vendor.state} {vendor.zipCode}</p>}
                {vendor.country && <p className="text-sm text-muted-foreground">{vendor.country}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Tax and registration details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.gstNumber && (
              <div>
                <p className="text-sm font-medium">GST Number</p>
                <p className="text-sm text-muted-foreground">{vendor.gstNumber}</p>
              </div>
            )}
            {vendor.cinNumber && (
              <div>
                <p className="text-sm font-medium">CIN Number</p>
                <p className="text-sm text-muted-foreground">{vendor.cinNumber}</p>
              </div>
            )}
            {vendor.vatNumber && (
              <div>
                <p className="text-sm font-medium">VAT Number</p>
                <p className="text-sm text-muted-foreground">{vendor.vatNumber}</p>
              </div>
            )}
            {vendor.costCentreNo && (
              <div>
                <p className="text-sm font-medium">Cost Centre Number</p>
                <p className="text-sm text-muted-foreground">{vendor.costCentreNo}</p>
              </div>
            )}
            {vendor.mrNo && (
              <div>
                <p className="text-sm font-medium">MR Number</p>
                <p className="text-sm text-muted-foreground">{vendor.mrNo}</p>
              </div>
            )}
            {vendor.remark && (
              <div>
                <p className="text-sm font-medium">Remarks</p>
                <p className="text-sm text-muted-foreground">{vendor.remark}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Added By</p>
                <p className="text-sm text-muted-foreground">
                  {vendor.addedByUser?.name || "Unknown"} ({vendor.addedByUser?.email})
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Created At</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(vendor.createdAt), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(vendor.updatedAt), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login Information */}
      <Card>
        <CardHeader>
          <CardTitle>Login Information</CardTitle>
          <CardDescription>Vendor portal access details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Login URL</p>
              <p className="text-sm text-blue-600 break-all">{vendor.loginurl}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Password Reset Required</p>
              <Badge variant={vendor.isPasswordReset ? "default" : "secondary"}>
                {vendor.isPasswordReset ? "Yes" : "No"}
              </Badge>
            </div>
            {vendor.lastLoginAt && (
              <div>
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(vendor.lastLoginAt), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            )}
           </div>
         </CardContent>
       </Card>

       {/* Password Dialog */}
       <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Password Reset Successful</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 py-4">
             <p className="text-sm text-muted-foreground">
               Vendor temporary password has been generated. This password will only be shown once.
             </p>
             <div className="flex items-center gap-2">
               <div className="p-3 bg-muted rounded-md flex-1 font-mono text-lg">
                 {newPassword}
               </div>
               <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                 <Copy className="h-4 w-4" />
               </Button>
             </div>
             <p className="text-sm text-muted-foreground">
               Please send this password to the vendor securely.
             </p>
           </div>
           <DialogFooter>
             <Button onClick={() => setShowPasswordDialog(false)}>Close</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 }
