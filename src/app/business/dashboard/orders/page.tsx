// src/app/(protected)/business/dashboard/orders/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Barcode,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  FlaskConical,
  Loader2,
  Search,
  User,
  X,
  PlusCircle,
  Upload,
  Eye,
  CalendarDays,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  orderNo: string;
  orderDate: string;
  createdAt: string;
  patientId: string;
  patient: {
    id: string;
    patientId: string;
    patientFName: string;
    patientLName: string;
    gender: string;
    age: string;
    email: string;
    mobileNo: string | null;
    mrno: string | null;
  };
  sample: {
    id: string;
    sampleId: string;
    sampleType: string;
    status: string;
    tatDueAt: string | null;
    testCatalogId: string;
    testName: string;
    testCode: string;
    subtests: string[];
    sampleTime?: string;
  } | null;
  remark: string | null;
};

// Status styles mapping from schema
const statusStyles: Record<string, string> = {
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

const statusLabels: Record<string, string> = {
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

function getStatusBadge(status: string) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-700";
  const label = statusLabels[status] || status;
  return (
    <Badge className={`${style} flex items-center gap-1 w-fit text-xs px-2 py-0.5`}>
      <Activity className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
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
    if (filters.startDate) params.set("dateFrom", filters.startDate);
    if (filters.endDate) params.set("dateTo", filters.endDate);
    params.set("limit", "100");

    try {
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        const mapped: Order[] = (data.orders || []).map((order: any) => ({
          id: order.id,
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          createdAt: order.createdAt,
          patientId: order.patientId,
          patient: order.patient,
          sample: order.sample,
          remark: order.remark,
        }));

        setOrders(mapped);
        setTotalPages(Math.ceil(mapped.length / itemsPerPage));
        setTotalRecords(mapped.length);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load orders' });
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setMessage({ type: 'error', text: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate]);

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
        const patientName = `${order.patient?.patientFName || ''} ${order.patient?.patientLName || ''}`.toLowerCase();
        return (
          order.orderNo.toLowerCase().includes(term) ||
          patientName.includes(term) ||
          (order.sample?.sampleId && order.sample.sampleId.toLowerCase().includes(term)) ||
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

  const handleFilter = () => {
    fetchOrders();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveFilters = filters.search !== '' || filters.startDate !== '' || filters.endDate !== '';

  const handleUpload = (sampleId: string | null | undefined) => {
    if (!sampleId) {
      setMessage({ type: 'error', text: 'No sample ID available for this order' });
      return;
    }
    router.push(`/business/dashboard/samples/${sampleId}`);
  };

  const handleAddInfo = (sampleId: string | null | undefined, testId: string | null | undefined, patientId: string) => {
    if (!sampleId) {
      setMessage({ type: 'error', text: 'No sample ID available for this order' });
      return;
    }
    if (!testId) {
      setMessage({ type: 'error', text: 'No test ID available for this order' });
      return;
    }
    
    const params = new URLSearchParams({
      patientId: patientId,
      sampleId: sampleId,
      testId: testId
    });
    router.push(`/business/dashboard/additional-info?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and track all test orders
            </p>
          </div>
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Link href="/business/dashboard/shipment/create">
              <ClipboardList className="h-4 w-4" /> Create Shipment
            </Link>
          </Button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-48">
              <Label className="text-xs text-gray-500">Start Date</Label>
              <div className="relative mt-1">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            <div className="w-48">
              <Label className="text-xs text-gray-500">End Date</Label>
              <div className="relative mt-1">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleFilter}
              className="h-9 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Filter Orders
            </Button>

            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search by Order ID, Patient, Sample ID..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
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
                <Link href="/business/dashboard/orders/create">
                  <ClipboardList className="h-4 w-4 mr-1" /> Create Order
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Order Info</TableHead>
                      <TableHead className="font-semibold">Patient Info</TableHead>
                      <TableHead className="font-semibold">Sample / Test</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      {/* <TableHead className="font-semibold text-right">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => {
                      const patientName = `${order.patient?.patientFName || ''} ${order.patient?.patientLName || ''}`.trim() || 'N/A';
                      const testId = order.sample?.testCatalogId;
                      
                      return (
                        <TableRow key={order.id} className="hover:bg-gray-50">
                          {/* Order Info Column */}
                          <TableCell className="align-top">
                            <div>
                              <div className="font-medium text-gray-900">
                                <span className="text-blue-600">{order.orderNo}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{formatDate(order.orderDate)}</span>
                              </div>
                              {order.remark && (
                                <div className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">
                                  Note: {order.remark}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Patient Info Column */}
                          <TableCell className="align-top">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-medium text-gray-900 text-sm">{patientName}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {order.patient?.patientId || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{order.patient?.email || 'N/A'}</span>
                              </div>
                              {order.patient?.mobileNo && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                  <Phone className="h-3 w-3" />
                                  <span>{order.patient.mobileNo}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Sample / Test Column */}
                          <TableCell className="align-top">
                            {order.sample ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <FlaskConical className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="font-medium text-sm">{order.sample.testName || order.sample.testCode || 'N/A'}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                  <div>Sample ID: {order.sample.sampleId}</div>
                                  <div>Type: {order.sample.sampleType}</div>
                                  {order.sample.tatDueAt && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>TAT: {formatDate(order.sample.tatDueAt)}</span>
                                    </div>
                                  )}
                                  {order.sample.subtests && order.sample.subtests.length > 0 && (
                                    <div className="text-gray-400 text-xs">
                                      +{order.sample.subtests.length} subtest(s)
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No test assigned</span>
                            )}
                          </TableCell>

                          {/* Status Column - ONLY using sample.status */}
                          <TableCell className="align-top">
                            {order.sample ? (
                              <div className="space-y-2">
                                {getStatusBadge(order.sample.status)}
                              </div>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-700">No Sample</Badge>
                            )}
                          </TableCell>

                          {/* Actions Column */}
                          {/* <TableCell className="text-right align-top">
                            <div className="flex justify-end gap-1">
                          
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpload(order.sample?.sampleId)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700"
                                title="Upload Sample"
                                disabled={!order.sample?.sampleId}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddInfo(order.sample?.sampleId, testId, order.patientId)}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-700"
                                title="Add Additional Information"
                                disabled={!order.sample?.sampleId || !testId}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/business/dashboard/orders/${order.id}`)}
                                className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-700"
                                title="View Order Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell> */}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
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