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
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Package,
  Search,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

interface Shipment {
  id: string;
  shipmentNo: string;
  courierNumber: string | null;
  courierService: string | null;
  courierDate: string | null;
  status: string;
  createdAt: string;
  sampleCount?: number;
}

const statusStyles: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-700",
  COURIERED: "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-yellow-100 text-yellow-700",
  RECEIVED: "bg-green-100 text-green-700",
  PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<string, string> = {
  CREATED: "Created",
  COURIERED: "Courtered",
  IN_TRANSIT: "In Transit",
  RECEIVED: "Received",
  PARTIALLY_RECEIVED: "Partially Received",
};

function getStatusBadge(status: string) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-700";
  const label = statusLabels[status] || status;
  return (
    <Badge className={`${style} flex items-center gap-1 w-fit text-xs px-2 py-0.5`}>
      <Truck className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export default function ShipmentListPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    dateFrom: '',
    dateTo: '',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 20;

  // Fetch shipments
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status !== "ALL") params.set("status", filters.status);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    params.set("limit", "100");

    try {
      const res = await fetch(`/api/shipments?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setShipments(data.shipments || []);
        setTotalPages(Math.ceil((data.shipments?.length || 0) / itemsPerPage));
        setTotalRecords(data.shipments?.length || 0);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load shipments' });
      }
    } catch (err) {
      console.error("Failed to fetch shipments:", err);
      setMessage({ type: 'error', text: 'Failed to load shipments' });
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Filter shipments based on search
  const filteredShipments = useMemo(() => {
    let filtered = shipments;
    
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter((shipment) => {
        return (
          shipment.shipmentNo.toLowerCase().includes(term) ||
          (shipment.courierNumber && shipment.courierNumber.toLowerCase().includes(term)) ||
          (shipment.courierService && shipment.courierService.toLowerCase().includes(term))
        );
      });
    }
    
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [shipments, filters.search]);

  // Paginate shipments
  const paginatedShipments = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredShipments.slice(start, start + itemsPerPage);
  }, [filteredShipments, page]);

  // Update total records and pages when filtered shipments change
  useEffect(() => {
    setTotalRecords(filteredShipments.length);
    setTotalPages(Math.ceil(filteredShipments.length / itemsPerPage));
    if (page > Math.ceil(filteredShipments.length / itemsPerPage) && filteredShipments.length > 0) {
      setPage(1);
    }
  }, [filteredShipments.length, page]);

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'ALL',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = filters.search !== '' || 
    filters.status !== 'ALL' || 
    filters.dateFrom !== '' || 
    filters.dateTo !== '';

  const handleView = (id: string) => {
    router.push(`/business/dashboard/shipment/${id}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMM yyyy");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">List of All Shipments</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and track all your shipments
            </p>
          </div>
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Link href="/business/dashboard/shipment/create">
              <Truck className="h-4 w-4" /> Add Shipment
            </Link>
          </Button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-48">
              <Label className="text-xs text-gray-500">From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            <div className="w-48">
              <Label className="text-xs text-gray-500">To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            <div className="w-40">
              <Label className="text-xs text-gray-500">Status</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="CREATED">Created</SelectItem>
                  <SelectItem value="COURIERED">Courtered</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search by Shipment No, Courier No, Courier Service..."
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
            {loading ? 'Loading...' : `${totalRecords} shipment(s)`}
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : paginatedShipments.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {hasActiveFilters ? 'No shipments match your filters' : 'No shipments found. Create your first shipment to get started!'}
            </p>
            {!hasActiveFilters && (
              <Button asChild className="mt-4" size="sm">
                <Link href="/business/dashboard/shipment/create">
                  <Truck className="h-4 w-4 mr-1" /> Add Shipment
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
                      <TableHead className="font-semibold">Shipment No</TableHead>
                      <TableHead className="font-semibold">Courier No</TableHead>
                      <TableHead className="font-semibold">Courier Date</TableHead>
                      <TableHead className="font-semibold">Courier Service</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedShipments.map((shipment) => (
                      <TableRow key={shipment.id} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="font-mono font-medium text-sm text-blue-600">
                            {shipment.shipmentNo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {shipment.courierNumber || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarIcon className="h-3 w-3 text-gray-400" />
                            <span>{formatDate(shipment.courierDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{shipment.courierService || "N/A"}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(shipment.id)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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