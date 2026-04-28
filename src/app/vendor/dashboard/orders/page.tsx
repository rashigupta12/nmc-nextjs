/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/vendor/dashboard/orders/page.tsx
"use client";

import React, { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Package,
  Search,
  Truck,
  X,
  Activity,
  ClipboardList,
  Clock,
  FileText,
  User,
  Barcode,
  FlaskConical,
  CheckCircle,
  XCircle,
  Clock8,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  orderNo: string;
  sampleId: string | null;
  patientId: string;
  patientFName?: string;
  patientLName?: string;
  vendorId: string;
  vendorName?: string;
  createdBy: string;
  createdByName?: string;
  addedBy: string;
  shipmentStatus: string;
  orderDate: string;
  statusCode: string;
  remark: string | null;
  totalAmount: string | null;
  currency: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  sample?: {
    id: string;
    sampleId: string;
    testCatalogId: string;
    testName?: string;
    testCode?: string;
    sampleType: string;
    status: string;
    tatDueAt: string | null;
    subtests: string[];
  };
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    shipmentStatus: 'ALL',
    paymentStatus: 'ALL',
    dateFrom: '',
    dateTo: '',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 20;

  // Fetch orders with filters
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.shipmentStatus !== "ALL") params.set("shipmentStatus", filters.shipmentStatus);
    if (filters.paymentStatus !== "ALL") params.set("paymentStatus", filters.paymentStatus);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    params.set("limit", "100");

    try {
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();

      // Map the data according to the actual API response structure
      const mapped: Order[] = (data.orders || []).map((order: any) => ({
        id: order.id,
        orderNo: order.orderNo,
        sampleId: order.sampleId,
        patientId: order.patientId,
        patientFName: order.patient?.patientFName,
        patientLName: order.patient?.patientLName,
        vendorId: order.vendorId,
        vendorName: order.vendor?.name,
        createdBy: order.createdBy,
        createdByName: order.createdByUser?.name,
        addedBy: order.addedBy,
        shipmentStatus: order.shipmentStatus,
        orderDate: order.orderDate,
        statusCode: order.statusCode,
        remark: order.remark,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        sample: order.sample ? {
          id: order.sample.id,
          sampleId: order.sample.sampleId,
          testCatalogId: order.sample.testCatalogId,
          testName: order.sample.testName,
          testCode: order.sample.testCode,
          sampleType: order.sample.sampleType,
          status: order.sample.status,
          tatDueAt: order.sample.tatDueAt,
          subtests: order.sample.subtests || [],
        } : undefined,
      }));

      setOrders(mapped);
      setTotalPages(Math.ceil(mapped.length / itemsPerPage));
      setTotalRecords(mapped.length);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setMessage({ type: 'error', text: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter((order) => {
        const patientName = `${order.patientFName || ''} ${order.patientLName || ''}`.toLowerCase();
        return (
          order.orderNo.toLowerCase().includes(term) ||
          patientName.includes(term) ||
          (order.sampleId && order.sampleId.toLowerCase().includes(term)) ||
          (order.remark && order.remark.toLowerCase().includes(term))
        );
      });
    }
    
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, filters.search]);

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, page]);

  // Update total records and pages when filtered orders change
  useEffect(() => {
    setTotalRecords(filteredOrders.length);
    setTotalPages(Math.ceil(filteredOrders.length / itemsPerPage));
    if (page > Math.ceil(filteredOrders.length / itemsPerPage) && filteredOrders.length > 0) {
      setPage(1);
    }
  }, [filteredOrders.length, page]);

  const getShipmentStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: JSX.Element }> = {
      Pending: { 
        label: "Pending", 
        className: "bg-yellow-100 text-yellow-800",
        icon: <Clock8 className="h-3 w-3" />
      },
      CREATED: { 
        label: "Created", 
        className: "bg-gray-100 text-gray-800",
        icon: <ClipboardList className="h-3 w-3" />
      },
      SHIPPED: { 
        label: "Shipped", 
        className: "bg-blue-100 text-blue-800",
        icon: <Truck className="h-3 w-3" />
      },
      IN_TRANSIT: { 
        label: "In Transit", 
        className: "bg-purple-100 text-purple-800",
        icon: <Package className="h-3 w-3" />
      },
      RECEIVED: { 
        label: "Received", 
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3 w-3" />
      },
      PARTIALLY_RECEIVED: { 
        label: "Partially Received", 
        className: "bg-orange-100 text-orange-800",
        icon: <Clock className="h-3 w-3" />
      },
    };
    const defaultConfig = { 
      label: status, 
      className: "bg-gray-100 text-gray-800",
      icon: <Activity className="h-3 w-3" />
    };
    const { label, className, icon } = config[status] || defaultConfig;
    return (
      <Badge className={`${className} flex items-center gap-1 w-fit`}>
        {icon}
        {label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: JSX.Element }> = {
      PENDING: { 
        label: "Pending", 
        className: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-3 w-3" />
      },
      PAID: { 
        label: "Paid", 
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3 w-3" />
      },
      FAILED: { 
        label: "Failed", 
        className: "bg-red-100 text-red-800",
        icon: <XCircle className="h-3 w-3" />
      },
      REFUNDED: { 
        label: "Refunded", 
        className: "bg-gray-100 text-gray-800",
        icon: <XCircle className="h-3 w-3" />
      },
    };
    const defaultConfig = { 
      label: status, 
      className: "bg-gray-100 text-gray-800",
      icon: <Activity className="h-3 w-3" />
    };
    const { label, className, icon } = config[status] || defaultConfig;
    return (
      <Badge className={`${className} flex items-center gap-1 w-fit`}>
        {icon}
        {label}
      </Badge>
    );
  };

  const getStatusCodeBadge = (code: string) => {
    const colors: Record<string, string> = {
      O001: "bg-blue-100 text-blue-800",
      O002: "bg-yellow-100 text-yellow-800",
      O003: "bg-green-100 text-green-800",
      O004: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={colors[code] || "bg-gray-100 text-gray-800"}>
        {code}
      </Badge>
    );
  };

  const hasActiveFilters = filters.search !== '' || 
    filters.shipmentStatus !== 'ALL' || 
    filters.paymentStatus !== 'ALL' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

 const handleUpload = (sampleId: string | null | undefined) => {
  if (!sampleId) {
    setMessage({ type: 'error', text: 'No sample ID available for this order' });
    return;
  }
  router.push(`/vendor/dashboard/samples/${sampleId}`);
};

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage orders, track shipments, and monitor test progress
            </p>
          </div>
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Link href="/vendor/dashboard/orders/create">
              <ClipboardList className="h-4 w-4" /> Create Order
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-gray-500">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Order ID, Patient name, Sample ID..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            
            {/* <div className="w-44">
              <Label className="text-xs text-gray-500">Shipment Status</Label>
              <Select 
                value={filters.shipmentStatus} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, shipmentStatus: v }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Shipment Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CREATED">Created</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* <div className="w-40">
              <Label className="text-xs text-gray-500">Payment Status</Label>
              <Select 
                value={filters.paymentStatus} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, paymentStatus: v }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Payment Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="w-40">
              <Label className="text-xs text-gray-500">From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            <div className="w-40">
              <Label className="text-xs text-gray-500">To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ 
                  search: '', 
                  shipmentStatus: 'ALL', 
                  paymentStatus: 'ALL',
                  dateFrom: '',
                  dateTo: '',
                })}
                className="h-9 px-3"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-gray-400">
            {loading ? 'Loading...' : `${totalRecords} order(s)`}
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">
            <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {hasActiveFilters ? 'No orders match your filters' : 'No orders found. Create your first order to get started!'}
            </p>
            {!hasActiveFilters && (
              <Button asChild className="mt-4" size="sm">
                <Link href="/vendor/dashboard/orders/create">
                  <ClipboardList className="h-4 w-4 mr-1" /> Create Order
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Order Details</TableHead>
                    <TableHead className="font-semibold">Patient Info</TableHead>
                    <TableHead className="font-semibold">Test & Sample</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    {/* <TableHead className="font-semibold">Payment</TableHead> */}
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const patientName = `${order.patientFName || ''} ${order.patientLName || ''}`.trim() || 'N/A';
                    const mainTest = order.sample;
                    return (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              <span className="text-blue-600">{order.orderNo}</span>
                              
                            </div>
                            <div className="text-xs text-gray-500 mt-1 space-x-2">
                              <span>Created: {formatDate(order.createdAt)}</span>
                              
                            </div>
                            {order.remark && (
                              <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                                Note: {order.remark}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium text-gray-900">{patientName}</span>
                            </div>
                            {order.sampleId && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Barcode className="h-3 w-3" />
                                <span> {order.sample?.sampleId || order.sampleId}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {mainTest ? (
                            <div>
                              <div className="flex items-center gap-2 text-sm">
                                <FlaskConical className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-medium">{mainTest.testName || mainTest.testCode || 'N/A'}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Type: {mainTest.sampleType}
                              </div>
                              {mainTest.subtests && mainTest.subtests.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  +{mainTest.subtests.length} subtest(s)
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No test assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {getShipmentStatusBadge(order.shipmentStatus)}
                            <div className="text-xs text-gray-400">
                              Order Date: {formatDate(order.orderDate)}
                            </div>
                          </div>
                        </TableCell>
                        {/* <TableCell>
                          <div className="space-y-2">
                            {getPaymentStatusBadge(order.paymentStatus)}
                            {order.totalAmount && (
                              <div className="text-sm font-medium text-gray-900">
                                {order.currency} {parseFloat(order.totalAmount).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell> */}
                     <TableCell className="text-right">
  <div className="flex justify-end gap-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleUpload(order.sample?.sampleId ?? null)}
      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700"
      title="Upload Sample"
      disabled={!order.sample?.sampleId}
    >
      <Upload className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm text-white z-50 ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <Activity className="h-4 w-4" />
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}