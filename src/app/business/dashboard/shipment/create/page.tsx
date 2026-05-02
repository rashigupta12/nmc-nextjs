"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/auth";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  CheckCircle,
  Loader2,
  Package,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

interface Order {
  id: string;
  orderNo: string;
  orderDate: string;
  patient: {
    id: string;
    patientId: string;
    patientFName: string;
    patientLName: string;
  };
  sample: {
    id: string;
    sampleId: string;
    testName: string;
    status: string;
  };
}

interface ShipmentFormData {
  courierNumber: string;
  courierService: string;
  courierDate: Date;
}

export default function CreateShipmentPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [shipmentNo, setShipmentNo] = useState<string>("");
  const [formData, setFormData] = useState<ShipmentFormData>({
    courierNumber: "",
    courierService: "",
    courierDate: new Date(),
  });

  // Fetch shippable orders (samples with status "CREATED")
  const fetchShippableOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/shippable");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        Swal.fire("Error", data.error || "Failed to fetch orders", "error");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire("Error", "Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate shipment number preview
  const generateShipmentNo = useCallback(async () => {
    if (!user?.vendorCode) return;
    
    const date = format(new Date(), "yyyyMMdd");
    const baseNo = `SH${user.vendorCode}${date}`;
    setShipmentNo(baseNo);
  }, [user?.vendorCode]);

  useEffect(() => {
    fetchShippableOrders();
    generateShipmentNo();
  }, [fetchShippableOrders, generateShipmentNo]);

  const handleSelectAll = () => {
    if (selectedOrderIds.size === orders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(orders.map(o => o.id)));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrderIds);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrderIds(newSelected);
  };

  const getSelectedSampleIds = () => {
    return orders
      .filter(order => selectedOrderIds.has(order.id))
      .map(order => order.sample.id);
  };

  const handleSubmit = async () => {
    if (selectedOrderIds.size === 0) {
      Swal.fire("Error", "Please select at least one order to ship", "error");
      return;
    }

    if (!formData.courierNumber) {
      Swal.fire("Error", "Please enter courier number", "error");
      return;
    }

    if (!formData.courierService) {
      Swal.fire("Error", "Please select courier service", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Shipment",
      html: `
        <div class="text-left">
          <p>Are you ready to send this shipment?</p>
          <div class="mt-3 p-3 bg-gray-50 rounded">
            <p class="font-semibold">Shipment Details:</p>
            <p class="text-sm">Number of orders: <strong>${selectedOrderIds.size}</strong></p>
            <p class="text-sm">Courier: <strong>${formData.courierService}</strong></p>
            <p class="text-sm">Tracking: <strong>${formData.courierNumber}</strong></p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Create Shipment",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);

    try {
      const payload = {
        courierNumber: formData.courierNumber,
        courierService: formData.courierService,
        courierDate: format(formData.courierDate, "yyyy-MM-dd"),
        sampleIds: getSelectedSampleIds(),
      };

      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await Swal.fire({
          title: "Shipment Created!",
          html: `
            <div class="text-left">
              <p>Shipment has been created successfully.</p>
              <div class="mt-3 p-3 bg-gray-50 rounded">
                <p class="font-semibold">Shipment Number:</p>
                <p class="text-blue-600 font-mono">${data.shipment.shipmentNo}</p>
                <p class="text-sm mt-2">Status: <strong>COURIERED</strong></p>
                <p class="text-sm">Samples shipped: <strong>${data.shipment.sampleCount}</strong></p>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "View Shipments",
        }).then(() => {
          router.push("/business/dashboard/shipment");
        });
      } else {
        throw new Error(data.error || "Failed to create shipment");
      }
    } catch (error: any) {
      console.error("Error creating shipment:", error);
      Swal.fire("Error", error.message || "Failed to create shipment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const courierServices = [
    "Blue Dart",
    "DTDC",
    "FedEx",
    "DHL",
    "India Post",
    "Delhivery",
    "Ecom Express",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/business/dashboard/shipment"
                className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shipments
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Shipment</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Create a new shipment and attach samples
                </p>
              </div>
            </div>
            {shipmentNo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <p className="text-xs text-blue-600 font-medium">Shipment No.</p>
                <p className="text-sm font-mono font-semibold text-blue-800">
                  {shipmentNo}...
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courier Details Card */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Courier Details
                </CardTitle>
                <CardDescription>Enter courier information for this shipment</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-5 pb-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Courier Number *</Label>
                    <Input
                      placeholder="e.g., 1234567890"
                      value={formData.courierNumber}
                      onChange={(e) => setFormData({ ...formData, courierNumber: e.target.value })}
                      className="mt-1.5 h-10"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Courier Service *</Label>
                    <Select
                      value={formData.courierService}
                      onValueChange={(value) => setFormData({ ...formData, courierService: value })}
                    >
                      <SelectTrigger className="mt-1.5 h-10">
                        <SelectValue placeholder="Select courier service" />
                      </SelectTrigger>
                      <SelectContent>
                        {courierServices.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Courier Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal mt-1.5 h-10 ${
                          !formData.courierDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.courierDate
                          ? format(formData.courierDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.courierDate}
                        onSelect={(date) =>
                          setFormData({ ...formData, courierDate: date || new Date() })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table Card */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-green-600" />
                  Select Orders to Ship
                </CardTitle>
                <CardDescription>
                  Select orders with samples ready for shipment (Status: CREATED)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-5 pb-5">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No shippable orders found.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Only orders with sample status "CREATED" can be shipped.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="text-sm"
                      >
                        {selectedOrderIds.size === orders.length
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                      <span className="ml-3 text-sm text-gray-500">
                        {selectedOrderIds.size} of {orders.length} selected
                      </span>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  selectedOrderIds.size === orders.length &&
                                  orders.length > 0
                                }
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead className="font-semibold">Order No</TableHead>
                            <TableHead className="font-semibold">Order Date</TableHead>
                            <TableHead className="font-semibold">Patient ID</TableHead>
                            <TableHead className="font-semibold">Patient Name</TableHead>
                            <TableHead className="font-semibold">Test</TableHead>
                            <TableHead className="font-semibold">Sample ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-gray-50">
                              <TableCell>
                                <Checkbox
                                  checked={selectedOrderIds.has(order.id)}
                                  onCheckedChange={() => handleSelectOrder(order.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm font-medium">
                                  {order.orderNo}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">
                                {format(new Date(order.orderDate), "dd MMM yyyy")}
                              </TableCell>
                              <TableCell className="text-sm font-mono">
                                {order.patient.patientId}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {order.patient.patientFName} {order.patient.patientLName}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {order.sample.testName}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-mono">
                                  {order.sample.sampleId}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Panel - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50/30 pb-3 pt-4 px-5">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Shipment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 px-5 pb-5">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-500 uppercase">
                      Shipment Details
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipment No:</span>
                        <span className="font-mono font-medium text-gray-900">
                          {shipmentNo || "Auto-generated"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Courier:</span>
                        <span className="font-medium">
                          {formData.courierService || "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tracking No:</span>
                        <span className="font-mono">
                          {formData.courierNumber || "Not entered"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Courier Date:</span>
                        <span>
                          {formData.courierDate
                            ? format(formData.courierDate, "dd MMM yyyy")
                            : "Not selected"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-500 uppercase">
                      Order Summary
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedOrderIds.size}
                        </p>
                        <p className="text-sm text-gray-600">Orders Selected</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          ⚠️ Once shipped, sample status will be updated to "SHIPPED"
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || selectedOrderIds.size === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating Shipment...</>
                    ) : (
                      <><Truck className="h-4 w-4 mr-2" />Create Shipment</>
                    )}
                  </Button>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800 text-center">
                      ⚠️ By creating this shipment, you confirm that all selected
                      samples are ready for dispatch.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}