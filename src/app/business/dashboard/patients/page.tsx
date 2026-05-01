/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/business/dashboard/patients/page.tsx
"use client";

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
  Edit,
  Eye,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

type Patient = {
  id: string;
  patientId: string;
  patientFName: string;
  patientMName?: string;
  patientLName: string;
  gender: "M" | "F" | "Other";
  dob: string;
  age: string;
  email: string;
  mobileNo?: string;
  ethinicity: string;
  lifestyle: string;
  smoking: string;
  isActive: boolean;
  mrno?: string;
  tag?: string;
  hospitalName: string;
  doctorFName: string;
  doctorLName?: string;
  vendorName?: string;
  vendorCode?: string;
  createdByName?: string;
  createdAt: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    gender: 'ALL',
    status: 'ALL',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 20;

  // Fetch patients with filters
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.gender !== "ALL") params.set("gender", filters.gender);
    if (filters.status !== "ALL")
      params.set("isActive", filters.status === "ACTIVE" ? "true" : "false");
    params.set("limit", "100");

    try {
      const res = await fetch(`/api/admin/patients?${params.toString()}`);
      const data = await res.json();

      const mapped: Patient[] = (data.patients || []).map((p: any) => ({
        id: p.id,
        patientId: p.patientId,
        patientFName: p.patientFName,
        patientMName: p.patientMName,
        patientLName: p.patientLName,
        gender: p.gender,
        dob: p.dob,
        age: p.age,
        email: p.email,
        mobileNo: p.mobileNo,
        ethinicity: p.ethinicity,
        lifestyle: p.lifestyle,
        smoking: p.smoking,
        isActive: p.isActive,
        mrno: p.mrno,
        tag: p.tag,
        hospitalName: p.hospitalName,
        doctorFName: p.doctorFName,
        doctorLName: p.doctorLName,
        vendorName: p.vendorName,
        vendorCode: p.vendorCode,
        createdByName: p.createdByName,
        createdAt: p.createdAt,
      }));

      setPatients(mapped);
      setTotalPages(Math.ceil(mapped.length / itemsPerPage));
      setTotalRecords(mapped.length);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setMessage({ type: 'error', text: 'Failed to load patients' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleDelete = async (patient: Patient) => {
    const fullName = `${patient.patientFName} ${patient.patientLName}`;

    const result = await Swal.fire({
      title: "Are you sure?",
      html: `You are about to delete <strong>"${fullName}"</strong>.<br>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/patients/${patient.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.softDeleted) {
          setPatients((prev) =>
            prev.map((p) => (p.id === patient.id ? { ...p, isActive: false } : p)),
          );
          setMessage({ type: 'success', text: 'Patient has been deactivated (has associated orders)' });
        } else {
          setPatients((prev) => prev.filter((p) => p.id !== patient.id));
          setMessage({ type: 'success', text: 'Patient deleted successfully' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to delete patient' });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage({ type: 'error', text: 'An error occurred while deleting' });
    }
  };

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    let filtered = patients;
    
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter((p) => {
        const fullName = `${p.patientFName} ${p.patientMName ?? ""} ${p.patientLName}`.toLowerCase();
        return (
          fullName.includes(term) ||
          p.email.toLowerCase().includes(term) ||
          p.patientId.toLowerCase().includes(term) ||
          (p.mrno ?? "").toLowerCase().includes(term)
        );
      });
    }
    
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [patients, filters.search]);

  // Paginate patients
  const paginatedPatients = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, page]);

  // Update total records and pages when filtered patients change
  useEffect(() => {
    setTotalRecords(filteredPatients.length);
    setTotalPages(Math.ceil(filteredPatients.length / itemsPerPage));
    setPage(1);
  }, [filteredPatients.length]);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Inactive
      </Badge>
    );
  };

  const getGenderBadge = (gender: string) => {
    const colors = {
      M: "bg-blue-100 text-blue-800",
      F: "bg-pink-100 text-pink-800",
      Other: "bg-purple-100 text-purple-800",
    };
    const labels = { M: "Male", F: "Female", Other: "Other" };
    return (
      <Badge className={`${colors[gender as keyof typeof colors]} hover:${colors[gender as keyof typeof colors]}`}>
        {labels[gender as keyof typeof labels]}
      </Badge>
    );
  };

  const hasActiveFilters = filters.search !== '' || filters.gender !== 'ALL' || filters.status !== 'ALL';

  const handleView = (id: string) => {
    window.location.href = `/business/dashboard/patients/${id}`;
  };

  const handleEdit = (id: string) => {
    window.location.href = `/business/dashboard/patients/${id}/edit`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Patient Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage patient records, view details, and track medical data
            </p>
          </div>
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Link href="/business/dashboard/patients/create">
              <Plus className="h-4 w-4" /> Add Patient
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
                  placeholder="Name, email, ID, MR number..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            
            <div className="w-40">
              <Label className="text-xs text-gray-500">Gender</Label>
              <Select value={filters.gender} onValueChange={(v) => setFilters(prev => ({ ...prev, gender: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Genders</SelectItem>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Label className="text-xs text-gray-500">Status</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ search: '', gender: 'ALL', status: 'ALL' })}
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
            {loading ? 'Loading...' : `${totalRecords} patient(s)`}
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : paginatedPatients.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">
            <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {hasActiveFilters ? 'No patients match your filters' : 'No patients found. Add your first patient to get started!'}
            </p>
            {!hasActiveFilters && (
              <Button asChild className="mt-4" size="sm">
                <Link href="/business/dashboard/patients/create">
                  <Plus className="h-4 w-4 mr-1" /> Add Patient
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
                    <TableHead className="font-semibold">Patient Details</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Medical Info</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.map((patient) => {
                    const fullName = `${patient.patientFName} ${patient.patientMName ? patient.patientMName + " " : ""}${patient.patientLName}`;
                    return (
                      <TableRow key={patient.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                              {fullName}
                              {patient.tag && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {patient.tag}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 space-x-2">
                              <span>ID: {patient.patientId}</span>
                              {patient.mrno && <span>| MR: {patient.mrno}</span>}
                              <span>| {getGenderBadge(patient.gender)}</span>
                              <span>| Age: {patient.age}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              DOB: {formatDate(patient.dob)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-gray-700">{patient.email}</span>
                            </div>
                            {patient.mobileNo && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-700">{patient.mobileNo}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="text-gray-700">
                              <span className="font-medium">Hospital:</span> {patient.hospitalName}
                            </div>
                            <div className="text-gray-700">
                              <span className="font-medium">Doctor:</span> Dr. {patient.doctorFName} {patient.doctorLName || ""}
                            </div>
                            {patient.vendorName && (
                              <div className="text-xs text-gray-500">
                                Vendor: {patient.vendorName}
                              </div>
                            )}
                            {(patient.ethinicity || patient.lifestyle) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {patient.ethinicity && <span>Ethnicity: {patient.ethinicity} | </span>}
                                {patient.lifestyle && <span>Lifestyle: {patient.lifestyle}</span>}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {getStatusBadge(patient.isActive)}
                            {patient.createdByName && (
                              <div className="text-xs text-gray-400">
                                Created: {formatDate(patient.createdAt)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(patient.id)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(patient.id)}
                              className="h-8 w-8 p-0 hover:bg-amber-50 hover:text-amber-700"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(patient)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
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
                  onClick={() => setPage(p => p - 1)}
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
                  onClick={() => setPage(p => p + 1)}
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