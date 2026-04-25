/*eslint-disable @typescript-eslint/no-explicit-any*/
// src/app/(protected)/dashboard/vendor/patients/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (genderFilter !== "ALL") params.set("gender", genderFilter);
        if (statusFilter !== "ALL")
          params.set("isActive", statusFilter === "ACTIVE" ? "true" : "false");
        params.set("limit", "100");

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
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [genderFilter, statusFilter]);

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
          await Swal.fire({
            icon: "info",
            title: "Deactivated",
            text: "Patient has been deactivated (has associated orders).",
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          setPatients((prev) => prev.filter((p) => p.id !== id));
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Patient has been deleted successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: "Failed to delete patient. Please try again.",
        });
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while deleting the patient.",
      });
    }
  };

  const filteredPatients = patients
    .filter((p) => {
      const fullName =
        `${p.patientFName} ${p.patientMName ?? ""} ${p.patientLName}`.toLowerCase();
      const term = searchTerm.toLowerCase();
      return (
        fullName.includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.patientId.toLowerCase().includes(term) ||
        (p.mrno ?? "").toLowerCase().includes(term)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const genderOptions = ["ALL", "M", "F", "Other"];
  const statusOptions = ["ALL", "ACTIVE", "INACTIVE"];

  const genderLabel = (g: string) =>
    g === "M" ? "Male" : g === "F" ? "Female" : g;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold bg-blue-700 bg-clip-text text-transparent">
            Patient Management
          </h2>
          <p className="text-gray-600 mt-2">
            Manage patient records, view details, and track medical data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Gender Filter */}
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-full sm:w-40 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((g) => (
                <SelectItem key={g} value={g} className="focus:bg-blue-50">
                  {g === "ALL" ? "All Genders" : genderLabel(g)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s} className="focus:bg-blue-50">
                  {s === "ALL" ? "All Status" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Patient Button */}
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg whitespace-nowrap"
          >
            <Link
              href="/dashboard/vendor/patients/create"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter((p) => p.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter((p) => !p.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No patients found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || genderFilter !== "ALL" || statusFilter !== "ALL"
                ? "Try adjusting your search or filter criteria"
                : "Add your first patient to get started!"}
            </p>
            {searchTerm || genderFilter !== "ALL" || statusFilter !== "ALL" ? (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setGenderFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                <Link
                  href="/dashboard/vendor/vendor/patients/create"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Patient
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-500 border-b border-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Gender / Age
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Doctor / Hospital
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Patient Name + ID */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {patient.patientFName}{" "}
                        {patient.patientMName ? patient.patientMName + " " : ""}
                        {patient.patientLName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        ID: {patient.patientId}
                      </div>
                      {patient.mrno && (
                        <div className="text-xs text-gray-400">
                          MR: {patient.mrno}
                        </div>
                      )}
                      {patient.tag && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {patient.tag}
                        </span>
                      )}
                    </td>

                    {/* Gender / Age */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          patient.gender === "M"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : patient.gender === "F"
                              ? "bg-pink-100 text-pink-800 border-pink-200"
                              : "bg-purple-100 text-purple-800 border-purple-200"
                        }`}
                      >
                        {genderLabel(patient.gender)}
                      </span>
                      <div className="text-sm text-gray-600 mt-1">
                        Age: {patient.age}
                      </div>
                      <div className="text-xs text-gray-400">
                        DOB: {patient.dob}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {patient.email}
                      </div>
                      {patient.mobileNo && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {patient.mobileNo}
                        </div>
                      )}
                    </td>

                    {/* Doctor / Hospital */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">
                        Dr. {patient.doctorFName} {patient.doctorLName ?? ""}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {patient.hospitalName}
                      </div>
                      {patient.vendorName && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {patient.vendorName} ({patient.vendorCode})
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          patient.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {patient.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-end">
                        {/* View */}
                        <Link href={`/dashboard/vendor/patients/${patient.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/dashboard/vendor/patients/${patient.id}/edit`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(patient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
