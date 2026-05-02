"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  CalendarIcon,
  CheckCircle,
  Loader2,
  Package,
  Truck,
  User,
  Mail,
  Phone,
  Barcode,
  FlaskConical,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";

interface ShipmentDetail {
  id: string;
  shipmentNo: string;
  courierNumber: string | null;
  courierService: string | null;
  courierDate: string | null;
  status: string;
  createdAt: string;
  receivedAt: string | null;
  receivedBy: string | null;
  vendor: {
    id: string;
    name: string;
    vendorCode: string;
    email: string;
  };
  samples: Array<{
    id: string;
    sampleId: string;
    status: string;
    sampleType: string;
    tatDueAt: string | null;
    order: {
      id: string;
      orderNo: string;
      orderDate: string;
      patient: {
        id: string;
        patientId: string;
        patientFName: string;
        patientLName: string;
        email: string;
        mobileNo: string | null;
      };
      test: {
        id: string;
        testName: string;
        testCode: string;
      };
    };
  }>;
}

const sampleStatusStyles: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  QC_PASSED: "bg-green-100 text-green-700",
  QC_FAILED: "bg-red-100 text-red-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  READY: "bg-purple-100 text-purple-700",
  REPORT_GENERATED: "bg-cyan-100 text-cyan-700",
  RELEASED: "bg-green-200 text-green-800",
  RESAMPLING: "bg-orange-100 text-orange-700",
};

const sampleStatusLabels: Record<string, string> = {
  CREATED: "Created",
  SHIPPED: "Shipped",
  RECEIVED: "Received",
  QC_PASSED: "QC Passed",
  QC_FAILED: "QC Failed",
  PROCESSING: "Processing",
  READY: "Ready",
  REPORT_GENERATED: "Report Generated",
  RELEASED: "Released",
  RESAMPLING: "Resampling",
};

function getSampleStatusBadge(status: string) {
  const style = sampleStatusStyles[status] || "bg-gray-100 text-gray-700";
  const label = sampleStatusLabels[status] || status;
  return (
    <Badge className={`${style} flex items-center gap-1 w-fit text-xs px-2 py-0.5`}>
      <FlaskConical className="h-3 w-3" />
      {label}
    </Badge>
  );
}

const shipmentStatusStyles: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-700",
  COURIERED: "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-yellow-100 text-yellow-700",
  RECEIVED: "bg-green-100 text-green-700",
  PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700",
};

function getShipmentStatusBadge(status: string) {
  const style = shipmentStatusStyles[status] || "bg-gray-100 text-gray-700";
  return (
    <Badge className={`${style} flex items-center gap-1 w-fit text-sm px-3 py-1`}>
      {status === "RECEIVED" ? <CheckCircle className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
      {status}
    </Badge>
  );
}

export default function AdminShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiving, setReceiving] = useState(false);

  const fetchShipment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shipments/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setShipment(data.shipment);
      } else {
        Swal.fire("Error", data.error || "Failed to load shipment", "error");
      }
    } catch (error) {
      console.error("Error fetching shipment:", error);
      Swal.fire("Error", "Failed to load shipment", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchShipment();
    }
  }, [params.id]);

  const handleMarkAsReceived = async () => {
    if (!shipment) return;
    
    if (shipment.status === "RECEIVED") {
      Swal.fire("Info", "Shipment already received", "info");
      return;
    }

    const result = await Swal.fire({
      title: "Mark Shipment as Received",
      html: `
        <div class="text-left">
          <p>Are you sure this shipment has been received?</p>
          <div class="mt-3 p-3 bg-gray-50 rounded">
            <p class="font-semibold">Shipment: ${shipment.shipmentNo}</p>
            <p class="text-sm">Vendor: ${shipment.vendor.name}</p>
            <p class="text-sm">Samples: ${shipment.samples.length}</p>
          </div>
          <p class="text-sm text-amber-600 mt-3">
            ⚠️ This will update all ${shipment.samples.length} sample(s) to "RECEIVED" status.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Mark as Received",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
    });

    if (!result.isConfirmed) return;

    setReceiving(true);
    try {
      const res = await fetch(`/api/admin/shipments/${shipment.id}/receive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await Swal.fire({
          title: "Shipment Received!",
          html: `
            <div class="text-left">
              <p>Shipment has been marked as received.</p>
              <div class="mt-3 p-3 bg-gray-50 rounded">
                <p class="font-semibold">${data.shipment.shipmentNo}</p>
                <p class="text-sm">Updated ${data.updatedCount} sample(s) to RECEIVED</p>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "OK",
        });
        
        // Refresh the page
        fetchShipment();
      } else {
        throw new Error(data.error || "Failed to mark shipment as received");
      }
    } catch (error: any) {
      console.error("Error marking shipment as received:", error);
      Swal.fire("Error", error.message || "Failed to mark shipment as received", "error");
    } finally {
      setReceiving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMM yyyy");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Shipment not found</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/shipments">Back to Shipments</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/admin/shipments"
                className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shipments
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shipment Details</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {shipment.shipmentNo}
                </p>
              </div>
            </div>
            {shipment.status !== "RECEIVED" && (
              <Button
                onClick={handleMarkAsReceived}
                disabled={receiving}
                className="bg-green-600 hover:bg-green-700"
              >
                {receiving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                ) : (
                  <><CheckCircle className="h-4 w-4 mr-2" />Mark as Received</>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courier Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Courier Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Courier No:</span>
                  <span className="font-mono font-medium">{shipment.courierNumber || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Courier Service:</span>
                  <span className="font-medium">{shipment.courierService || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Courier Date:</span>
                  <span>{formatDate(shipment.courierDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  {getShipmentStatusBadge(shipment.status)}
                </div>
                {shipment.receivedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Received At:</span>
                    <span>{formatDate(shipment.receivedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vendor Details */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-purple-600" />
                  Vendor Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium text-gray-900">{shipment.vendor.name}</p>
                <p className="text-sm text-gray-500">Code: {shipment.vendor.vendorCode}</p>
                <p className="text-sm text-gray-500">Email: {shipment.vendor.email}</p>
              </CardContent>
            </Card>
          </div>

          {/* Samples Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-green-600" />
                  Samples in Shipment
                </CardTitle>
                <CardDescription>
                  {shipment.samples.length} sample(s) included in this shipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Order No</TableHead>
                        <TableHead>Patient Details</TableHead>
                        <TableHead>Test Details</TableHead>
                        <TableHead>Sample ID</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipment.samples.map((sample) => (
                        <TableRow key={sample.id} className="hover:bg-gray-50">
                          <TableCell>
                            <span className="font-mono text-sm font-medium text-blue-600">
                              {sample.order.orderNo}
                            </span>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {formatDate(sample.order.orderDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {sample.order.patient.patientFName} {sample.order.patient.patientLName}
                              </p>
                              <p className="text-xs text-gray-500">ID: {sample.order.patient.patientId}</p>
                              {sample.order.patient.email && (
                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                  <Mail className="h-3 w-3" />
                                  <span>{sample.order.patient.email}</span>
                                </div>
                              )}
                              {sample.order.patient.mobileNo && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Phone className="h-3 w-3" />
                                  <span>{sample.order.patient.mobileNo}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">{sample.order.test.testName}</p>
                            <p className="text-xs text-gray-500">Code: {sample.order.test.testCode}</p>
                            <p className="text-xs text-gray-400">Type: {sample.sampleType}</p>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{sample.sampleId}</span>
                          </TableCell>
                          <TableCell>
                            {getSampleStatusBadge(sample.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}