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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Clock8,
  FileText,
  FlaskConical,
  Loader2,
  Package,
  Search,
  Truck,
  Upload,
  User,
  X,
  XCircle,
  PlusCircle,
  Download,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";

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

// Map test codes to their corresponding report types
const TEST_TO_REPORT_MAP: Record<string, { id: string; label: string }> = {
  // NMC Genetics Tests
  'NMC-MI01': { id: 'immunity', label: 'Immunity Report' },
  'NMC-WH01': { id: 'women-health', label: "Women's Health Report" },
  'NMC-SL01': { id: 'sleep', label: 'Sleep Report' },
  'NMC-MH01': { id: 'men-health', label: "Men's Health Report" },
  'NMC-EH01': { id: 'eye-health', label: 'Eye Health Report' },
  'NMC-AI01': { id: 'autoimmune-health', label: 'Autoimmune Report' },
  'NMC-KH01': { id: 'kidney-health', label: 'Kidney Health Report' },
  
  // Pharmacogenetic Tests
  'NMC_CLOPI': { id: 'clopidogrel', label: 'Clopidogrel Report' },
  'NMC_STN': { id: 'statin', label: 'Statin Report' },
  'NMC_WAC': { id: 'warfarin', label: 'Warfarin Report' },
  'NMC-HTN': { id: 'hypertension', label: 'Hypertension Report' },
};

// Fallback: Map test names that might not have test codes
const TEST_NAME_TO_REPORT_MAP: Record<string, { id: string; label: string }> = {
  'Immunity': { id: 'immunity', label: 'Immunity Report' },
  "Women's Health": { id: 'women-health', label: "Women's Health Report" },
  'Sleep': { id: 'sleep', label: 'Sleep Report' },
  "Men's Health": { id: 'men-health', label: "Men's Health Report" },
  'Eye Health': { id: 'eye-health', label: 'Eye Health Report' },
  'Autoimmune': { id: 'autoimmune-health', label: 'Autoimmune Report' },
  'Kidney Health': { id: 'kidney-health', label: 'Kidney Health Report' },
  'Clopidogrel': { id: 'clopidogrel', label: 'Clopidogrel Report' },
  'Statin': { id: 'statin', label: 'Statin Report' },
  'Warfarin': { id: 'warfarin', label: 'Warfarin Report' },
  'Hypertension': { id: 'hypertension', label: 'Hypertension Report' },
};

// Helper function to get report type for a test
function getReportTypeForTest(testCode?: string, testName?: string): { id: string; label: string } | null {
  // First try by test code
  if (testCode && TEST_TO_REPORT_MAP[testCode]) {
    return TEST_TO_REPORT_MAP[testCode];
  }
  
  // Then try by test name
  if (testName) {
    for (const [key, value] of Object.entries(TEST_NAME_TO_REPORT_MAP)) {
      if (testName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
  }
  
  return null;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  
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

      if (data.success) {
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
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load orders' });
      }
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

  const handleGenerateReport = async (sampleId: string | null | undefined, reportTypeId: string, format: 'pdf' | 'html' = 'html') => {
    if (!sampleId) {
      setMessage({ type: 'error', text: 'No sample ID available for this order' });
      return;
    }

    const reportKey = `${sampleId}-${reportTypeId}`;
    setGeneratingReport(reportKey);
    
    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sample_id: sampleId,
          report_type: reportTypeId,
          format,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.Error || 'Report generation failed');
      }

      if (format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportTypeId}-report-${sampleId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ type: 'success', text: 'Report generated successfully!' });
      } else if (format === 'html') {
        const html = await response.text();
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Report generation error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to generate report' });
    } finally {
      setGeneratingReport(null);
    }
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
            <Link href="/business/dashboard/orders/create">
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
                <Link href="/business/dashboard/orders/create">
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
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const patientName = `${order.patientFName || ''} ${order.patientLName || ''}`.trim() || 'N/A';
                    const mainTest = order.sample;
                    const testId = mainTest?.testCatalogId;
                    const testCode = mainTest?.testCode;
                    const testName = mainTest?.testName;
                    
                    // Get the appropriate report type for this test
                    const reportType = getReportTypeForTest(testCode, testName);
                    const isGenerating = generatingReport === `${order.sample?.sampleId}-${reportType?.id}`;
                    
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
                                <span>Sample: {order.sample?.sampleId || order.sampleId}</span>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Upload Sample Button */}
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

                            {/* Add Additional Info Button */}
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

                            {/* Generate Report Button - Only show if a matching report type exists */}
                            {reportType && order.sample?.sampleId && testId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleGenerateReport(order.sample?.sampleId, reportType.id, 'pdf')}
                                className="h-8 px-2 gap-1 hover:bg-indigo-50 hover:text-indigo-700"
                                title={reportType.label}
                                disabled={isGenerating}
                              >
                                {isGenerating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <FileText className="h-4 w-4" />
                                )}
                                <span className="text-xs hidden sm:inline">Report</span>
                              </Button>
                            )}
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