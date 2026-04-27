/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/vendor/patients/page.tsx
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
  Activity,
  AlertCircle,
  Calendar,
  ChevronDown,
  Edit,
  Eye,
  Hospital,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Stethoscope,
  Tag,
  Trash2,
  X
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

// Accordion Component for Patient List
function PatientAccordion({ patient, onView, onEdit, onDelete }: { 
  patient: Patient; 
  onView: (id: string) => void; 
  onEdit: (id: string) => void; 
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const fullName = `${patient.patientFName} ${patient.patientMName ? patient.patientMName + " " : ""}${patient.patientLName}`;
  const genderLabel = patient.gender === "M" ? "Male" : patient.gender === "F" ? "Female" : "Other";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-gray-900">{fullName}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
              patient.isActive
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            }`}>
              {patient.isActive ? "Active" : "Inactive"}
            </span>
            {patient.tag && (
              <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {patient.tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
            <span>ID: {patient.patientId}</span>
            {patient.mrno && <span>MR: {patient.mrno}</span>}
            <span>{genderLabel}</span>
            <span>Age: {patient.age}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onView(patient.id); }}
            className="rounded-lg hover:bg-blue-50 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onEdit(patient.id); }}
            className="rounded-lg hover:bg-amber-50 hover:text-amber-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(patient.id); }}
            className="rounded-lg text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Contact Information */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Information</h4>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{patient.email}</span>
              </div>
              {patient.mobileNo && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{patient.mobileNo}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">DOB: {patient.dob}</span>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Medical Information</h4>
              <div className="flex items-center gap-2 text-sm">
                <Hospital className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{patient.hospitalName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">Dr. {patient.doctorFName} {patient.doctorLName || ""}</span>
              </div>
              {patient.vendorName && (
                <div className="text-xs text-gray-500">
                  Vendor: {patient.vendorName} ({patient.vendorCode})
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Additional Information</h4>
              {patient.ethinicity && (
                <div className="text-sm text-gray-700">Ethnicity: {patient.ethinicity}</div>
              )}
              {patient.lifestyle && (
                <div className="text-sm text-gray-700">Lifestyle: {patient.lifestyle}</div>
              )}
              {patient.smoking && (
                <div className="text-sm text-gray-700">Smoking: {patient.smoking}</div>
              )}
              {patient.createdByName && (
                <div className="text-xs text-gray-400 mt-2">
                  Created by: {patient.createdByName}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const handleDelete = async (id: string) => {
    const patient = patients.find((p) => p.id === id);
    const fullName = `${patient?.patientFName} ${patient?.patientLName}`;

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
      const res = await fetch(`/api/admin/patients/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.softDeleted) {
          setPatients((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)),
          );
          setMessage({ type: 'success', text: 'Patient has been deactivated (has associated orders)' });
        } else {
          setPatients((prev) => prev.filter((p) => p.id !== id));
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

  // Filter and paginate patients
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

  const paginatedPatients = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, page]);

  const totalRecords = filteredPatients.length;
  const activeCount = patients.filter(p => p.isActive).length;
  const inactiveCount = patients.filter(p => !p.isActive).length;

  const hasActiveFilters = filters.search !== '' || filters.gender !== 'ALL' || filters.status !== 'ALL';

  const handleView = (id: string) => {
    window.location.href = `/dashboard/vendor/patients/${id}`;
  };

  const handleEdit = (id: string) => {
    window.location.href = `/dashboard/vendor/patients/${id}/edit`;
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Patient Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage patient records, view details, and track medical data</p>
          </div>
          <Button asChild size="sm" className="gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700">
            <Link href="/dashboard/vendor/patients/create">
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

        {/* Stats line */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-gray-400">
            {loading ? 'Loading...' : `${totalRecords} patient(s) · Page ${page} of ${totalPages}`}
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Patient List */}
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
                <Link href="/dashboard/vendor/patients/create">
                  <Plus className="h-4 w-4 mr-1" /> Add Patient
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedPatients.map((patient) => (
              <PatientAccordion
                key={patient.id}
                patient={patient}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p - 1)} 
              disabled={page === 1}
            >
              Previous
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
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm text-white z-50 ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {message.type === 'success' ? <Activity className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}