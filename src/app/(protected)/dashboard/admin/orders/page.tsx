"use client";

import { Badge } from "@/components/ui/badge";
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
import {
  Activity,
  Barcode,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
  Mail,
  Phone,
  Search,
  Upload,
  X,
  XCircle,
  Eye,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Sample {
  id: string;
  sampleId: string;
  status: string;
  sampleType: string;
  tatDueAt: string | null;
  qcRejectionReason: string | null;
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
  vendor: {
    id: string;
    name: string;
    vendorCode: string;
  };
}

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

  if (status === "RECEIVED") {
    return (
      <Badge className={`${style} flex items-center gap-1 text-xs px-2 py-0.5`}>
        <Clock className="h-3 w-3" /> {label}
      </Badge>
    );
  }
  if (status === "QC_PASSED") {
    return (
      <Badge className={`${style} flex items-center gap-1 text-xs px-2 py-0.5`}>
        <CheckCircle className="h-3 w-3" /> {label}
      </Badge>
    );
  }
  if (status === "QC_FAILED") {
    return (
      <Badge className={`${style} flex items-center gap-1 text-xs px-2 py-0.5`}>
        <XCircle className="h-3 w-3" /> {label}
      </Badge>
    );
  }

  return <Badge className={`${style} text-xs px-2 py-0.5`}>{label}</Badge>;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    vendorId: "ALL",
    dateFrom: "",
    dateTo: "",
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 20;

  const fetchSamples = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status !== "ALL") params.set("status", filters.status);
    if (filters.vendorId !== "ALL") params.set("vendorId", filters.vendorId);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    params.set("limit", "100");

    try {
      const res = await fetch(`/api/admin/samples?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setSamples(data.samples || []);
        setTotalPages(Math.ceil((data.samples?.length || 0) / itemsPerPage));
        setTotalRecords(data.samples?.length || 0);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load samples" });
      }
    } catch (err) {
      console.error("Failed to fetch samples:", err);
      setMessage({ type: "error", text: "Failed to load samples" });
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.vendorId, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const filteredSamples = useMemo(() => {
    let filtered = samples;

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter((sample) => {
        return (
          sample.order.orderNo.toLowerCase().includes(term) ||
          sample.sampleId.toLowerCase().includes(term) ||
          `${sample.order.patient.patientFName} ${sample.order.patient.patientLName}`
            .toLowerCase()
            .includes(term) ||
          (sample.vendor.name && sample.vendor.name.toLowerCase().includes(term))
        );
      });
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.order.orderDate).getTime() - new Date(a.order.orderDate).getTime()
    );
  }, [samples, filters.search]);

  const paginatedSamples = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredSamples.slice(start, start + itemsPerPage);
  }, [filteredSamples, page]);

  useEffect(() => {
    setTotalRecords(filteredSamples.length);
    setTotalPages(Math.ceil(filteredSamples.length / itemsPerPage));
    if (
      page > Math.ceil(filteredSamples.length / itemsPerPage) &&
      filteredSamples.length > 0
    ) {
      setPage(1);
    }
  }, [filteredSamples.length, page]);

  const handleReset = () => {
    setFilters({
      search: "",
      status: "ALL",
      vendorId: "ALL",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "ALL" ||
    filters.vendorId !== "ALL" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "";

  const handleQCPass = async (sample: Sample) => {
    if (sample.status !== "RECEIVED") {
      setMessage({ type: "error", text: "QC can only be performed on received samples" });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm QC Pass",
      html: `
        <div class="text-left">
          <p>Are you sure this sample has passed Quality Control?</p>
          <div class="mt-3 p-3 bg-gray-50 rounded">
            <p class="font-semibold">Sample: ${sample.sampleId}</p>
            <p class="text-sm">Order: ${sample.order.orderNo}</p>
            <p class="text-sm">Test: ${sample.order.test.testName}</p>
            <p class="text-sm">Patient: ${sample.order.patient.patientFName} ${sample.order.patient.patientLName}</p>
          </div>
          <p class="text-sm text-green-600 mt-3">
            ✅ This will mark the sample as "QC_PASSED"
          </p>
        </div>
      `,
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Yes, Pass QC",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
    });

    if (!result.isConfirmed) return;

    setProcessingId(sample.id);

    try {
      const res = await fetch(`/api/admin/samples/${sample.id}/qc-pass`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await Swal.fire({
          title: "QC Passed!",
          text: `Sample ${sample.sampleId} has been marked as QC_PASSED.`,
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchSamples();
      } else {
        throw new Error(data.error || "Failed to update QC status");
      }
    } catch (error: unknown) {
      console.error("Error updating QC status:", error);
      Swal.fire(
        "Error",
        error instanceof Error ? error.message : "Failed to update QC status",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleQCFail = async (sample: Sample) => {
    if (sample.status !== "RECEIVED") {
      setMessage({ type: "error", text: "QC can only be performed on received samples" });
      return;
    }

    const { value: reason } = await Swal.fire({
      title: "Confirm QC Fail",
      html: `
        <div class="text-left">
          <p>Are you sure this sample has failed Quality Control?</p>
          <div class="mt-3 p-3 bg-gray-50 rounded">
            <p class="font-semibold">Sample: ${sample.sampleId}</p>
            <p class="text-sm">Order: ${sample.order.orderNo}</p>
            <p class="text-sm">Test: ${sample.order.test.testName}</p>
          </div>
        </div>
      `,
      icon: "warning",
      input: "textarea",
      inputPlaceholder: "Please provide a reason for QC failure (optional)...",
      inputLabel: "Rejection Reason",
      showCancelButton: true,
      confirmButtonText: "Yes, Fail QC",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (reason === undefined) return;

    setProcessingId(sample.id);

    try {
      const res = await fetch(`/api/admin/samples/${sample.id}/qc-fail`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "" }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await Swal.fire({
          title: "QC Failed",
          text: `Sample ${sample.sampleId} has been marked as QC_FAILED.${
            reason ? ` Reason: ${reason}` : ""
          }`,
          icon: "warning",
          confirmButtonText: "OK",
        });
        fetchSamples();
      } else {
        throw new Error(data.error || "Failed to update QC status");
      }
    } catch (error: unknown) {
      console.error("Error updating QC status:", error);
      Swal.fire(
        "Error",
        error instanceof Error ? error.message : "Failed to update QC status",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

 // Update the handleUpload and handleViewDetails functions
const handleUpload = (sample: Sample) => {
  if (sample.status !== "QC_PASSED") {
    setMessage({ type: "error", text: "Upload only allowed for QC_PASSED samples" });
    return;
  }
  // Use sample.sampleId (the string ID like SMP-26050200001) instead of sample.id (UUID)
  router.push(`/dashboard/admin/samples/${sample.sampleId}`);
};

const handleViewDetails = (sample: Sample) => {
  // Use sample.sampleId (the string ID) for consistency
  router.push(`/dashboard/admin/samples/${sample.sampleId}`);
};

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMM yyyy");
  };

  const renderActions = (sample: Sample) => {
    if (sample.status === "RECEIVED") {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleQCPass(sample)}
            disabled={processingId === sample.id}
            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
          >
            {processingId === sample.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            onClick={() => handleQCFail(sample)}
            disabled={processingId === sample.id}
            variant="destructive"
            className="h-8 px-3"
          >
            {processingId === sample.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5 mr-1" />
            )}
            Reject
          </Button>
        </div>
      );
    } else if (sample.status === "QC_PASSED") {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleUpload(sample)}
            className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3"
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            Upload CSV
          </Button>
          <Button
            size="sm"
            onClick={() => handleViewDetails(sample)}
            variant="outline"
            className="h-8 px-3"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
        </div>
      );
    } else if (sample.status === "QC_FAILED") {
      return (
        <div className="text-center">
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
          {sample.qcRejectionReason && (
            <p
              className="text-xs text-gray-500 mt-1 max-w-[150px] truncate"
              title={sample.qcRejectionReason}
            >
              Reason: {sample.qcRejectionReason}
            </p>
          )}
        </div>
      );
    } else {
      return (
        <Button
          size="sm"
          onClick={() => handleViewDetails(sample)}
          variant="outline"
          className="h-8 px-3"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage orders for received samples
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-48">
              <Label className="text-xs text-gray-500">From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>

            <div className="w-48">
              <Label className="text-xs text-gray-500">To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>

            <div className="w-40">
              <Label className="text-xs text-gray-500">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="QC_PASSED">QC Passed</SelectItem>
                  <SelectItem value="QC_FAILED">QC Failed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search by Order No, Sample ID, Patient, Vendor..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleReset} className="h-9 px-3">
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-gray-400">
            {loading ? "Loading..." : `${totalRecords} sample(s)`}
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : paginatedSamples.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">
            <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {hasActiveFilters ? "No samples match your filters" : "No samples found"}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Order No</TableHead>
                      <TableHead className="font-semibold">Patient Details</TableHead>
                      <TableHead className="font-semibold">Test / Sample</TableHead>
                      <TableHead className="font-semibold">Vendor</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSamples.map((sample) => (
                      <TableRow key={sample.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <span className="font-mono text-sm font-medium text-blue-600">
                              {sample.order.orderNo}
                            </span>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {formatDate(sample.order.orderDate)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {sample.order.patient.patientFName}{" "}
                              {sample.order.patient.patientLName}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {sample.order.patient.patientId}
                            </p>
                            {sample.order.patient.email && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">
                                  {sample.order.patient.email}
                                </span>
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
                          <div>
                            <p className="text-sm font-medium">{sample.order.test.testName}</p>
                            <p className="text-xs text-gray-500">
                              Code: {sample.order.test.testCode}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <Barcode className="h-3 w-3" />
                              <span className="font-mono">{sample.sampleId}</span>
                            </div>
                            <p className="text-xs text-gray-400">Type: {sample.sampleType}</p>
                            {sample.tatDueAt && (
                              <p className="text-xs text-gray-400">
                                TAT: {formatDate(sample.tatDueAt)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{sample.vendor.name}</p>
                            <p className="text-xs text-gray-500">{sample.vendor.vendorCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(sample.status)}</TableCell>
                        <TableCell className="text-center">
                          {renderActions(sample)}
                        </TableCell>
                      </TableRow>
                    ))}
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        <div
          className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm text-white z-50 ${
            message.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
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