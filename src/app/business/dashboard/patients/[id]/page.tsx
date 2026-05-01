// src/app/(protected)/business/dashboard/patients/[id]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  Hospital,
  User,
  Heart,
  Activity,
  Droplet,
  Weight,
  Ruler,
  Tag,
  IdCard,
  FileText,
  Pill,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface PatientDetails {
  id: string;
  patientId: string;
  patientFName: string;
  patientMName: string | null;
  patientLName: string;
  gender: "M" | "F" | "Other";
  dob: string | null;
  age: string;
  email: string;
  mobileNo: string | null;
  phoneNo: string | null;
  ethinicity: string;
  lifestyle: string;
  smoking: string;
  isActive: boolean;
  mrno: string | null;
  tag: string | null;
  hospitalName: string;
  doctorFName: string;
  doctorLName: string | null;
  clinic: string | null;
  vendorName?: string;
  vendorCode?: string;
  createdByName?: string;
  createdByEmail?: string;
  createdAt: string;
  updatedAt: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    fullAddress: string;
  };
  height: string;
  weight: string;
  patientHistory: string | null;
  medication: string | null;
  familyHistory: string | null;
  alcoholic: number;
  medicalHistory: string | null;
  chestPain: "yes" | "no";
  cardiacEnzyme: "yes" | "no";
  cholestrol: string | null;
  hdl: string | null;
  ldl: string | null;
  triglycerides: string | null;
  hbValue: string | null;
  bp_systolic: string | null;
  bp_diastolic: string | null;
  _counts?: {
    orders: number;
    samples: number;
  };
}

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const res = await fetch(`/api/admin/patients/${patientId}`);
        const data = await res.json();
        
        if (data.patient) {
          setPatient(data.patient);
        } else {
          Swal.fire("Error", "Patient not found", "error");
          router.push("/business/dashboard/patients");
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
        Swal.fire("Error", "Failed to load patient details", "error");
        router.push("/business/dashboard/patients");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId, router]);

  const getFullName = () => {
    const parts = [patient?.patientFName];
    if (patient?.patientMName) parts.push(patient.patientMName);
    if (patient?.patientLName) parts.push(patient.patientLName);
    return parts.join(" ");
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "M": return "Male";
      case "F": return "Female";
      default: return "Other";
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inactive</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/business/dashboard/patients"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Patients
              </Link>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {getFullName()}
                </h1>
                {getStatusBadge(patient.isActive)}
                {patient.tag && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Tag className="h-3 w-3 mr-1" />
                    {patient.tag}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Patient ID: {patient.patientId} | MR No: {patient.mrno || "N/A"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(`/business/dashboard/patients/${patientId}/edit`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit Patient
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal & Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900 mt-1">{getFullName()}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Patient ID</label>
                    <p className="text-gray-900 mt-1 font-mono">{patient.patientId}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900 mt-1">{getGenderLabel(patient.gender)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900 mt-1">
                      {patient.dob ? formatDate(patient.dob) : "N/A"}
                      {patient.age && <span className="text-gray-500 text-sm ml-2">(Age: {patient.age} years)</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Height & Weight</label>
                    <p className="text-gray-900 mt-1">
                      {patient.height} cm / {patient.weight} kg
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">MR Number</label>
                    <p className="text-gray-900 mt-1 font-mono">{patient.mrno || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-xs font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{patient.email}</p>
                    </div>
                  </div>
                  {patient.mobileNo && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <label className="text-xs font-medium text-gray-500">Mobile Number</label>
                        <p className="text-gray-900">{patient.mobileNo}</p>
                      </div>
                    </div>
                  )}
                  {patient.phoneNo && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <label className="text-xs font-medium text-gray-500">Phone Number</label>
                        <p className="text-gray-900">{patient.phoneNo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            {patient.address && (patient.address.street || patient.address.city) && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {patient.address.street && (
                      <p className="text-gray-900">{patient.address.street}</p>
                    )}
                    <p className="text-gray-900">
                      {[
                        patient.address.city,
                        patient.address.state,
                        patient.address.zipCode,
                        patient.address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {patient.address.fullAddress && (
                      <p className="text-gray-500 text-sm mt-1">{patient.address.fullAddress}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medical Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50 border-b">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Doctor & Hospital */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Doctor</label>
                    <p className="text-gray-900 mt-1">
                      Dr. {patient.doctorFName} {patient.doctorLName || ""}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Hospital</label>
                    <p className="text-gray-900 mt-1">{patient.hospitalName}</p>
                  </div>
                  {patient.clinic && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Clinic</label>
                      <p className="text-gray-900 mt-1">{patient.clinic}</p>
                    </div>
                  )}
                </div>

                {/* Medical History */}
                {patient.patientHistory && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Patient History
                    </label>
                    <p className="text-gray-700 mt-1 text-sm">{patient.patientHistory}</p>
                  </div>
                )}

                {/* Medications */}
                {patient.medication && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Pill className="h-3 w-3" /> Current Medication
                    </label>
                    <p className="text-gray-700 mt-1 text-sm">{patient.medication}</p>
                  </div>
                )}

                {/* Family History */}
                {patient.familyHistory && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Family History
                    </label>
                    <p className="text-gray-700 mt-1 text-sm">{patient.familyHistory}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Health Metrics */}
          <div className="space-y-6">
            {/* Stats Cards */}
            {patient._counts && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{patient._counts.orders}</div>
                    <div className="text-xs text-gray-600 mt-1">Total Orders</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{patient._counts.samples}</div>
                    <div className="text-xs text-gray-600 mt-1">Total Samples</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Demographic Info */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-50 border-b">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Demographic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Ethnicity</label>
                  <p className="text-gray-900 font-medium">{patient.ethinicity}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Lifestyle</label>
                  <p className="text-gray-900 font-medium">{patient.lifestyle}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Smoking</label>
                  <p className="text-gray-900 font-medium">{patient.smoking}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Alcoholic</label>
                  <p className="text-gray-900 font-medium">{patient.alcoholic === 1 ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Cardiovascular Health */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-50 border-b">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Cardiovascular Health
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Chest Pain</label>
                    <p className="text-gray-900 font-medium capitalize">{patient.chestPain}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Cardiac Enzyme</label>
                    <p className="text-gray-900 font-medium capitalize">{patient.cardiacEnzyme}</p>
                  </div>
                </div>
                {(patient.cholestrol || patient.hdl || patient.ldl || patient.triglycerides) && (
                  <>
                    <div className="border-t pt-3">
                      <label className="text-xs font-medium text-gray-500 mb-2 block">Lipid Profile</label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {patient.cholestrol && <div><span className="text-gray-500">Cholestrol:</span> {patient.cholestrol} mg/dL</div>}
                        {patient.hdl && <div><span className="text-gray-500">HDL:</span> {patient.hdl} mg/dL</div>}
                        {patient.ldl && <div><span className="text-gray-500">LDL:</span> {patient.ldl} mg/dL</div>}
                        {patient.triglycerides && <div><span className="text-gray-500">Triglycerides:</span> {patient.triglycerides} mg/dL</div>}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Vital Signs */}
            {(patient.hbValue || patient.bp_systolic || patient.bp_diastolic) && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-50 border-b">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {patient.hbValue && (
                    <div>
                      <label className="text-xs text-gray-500">Hemoglobin</label>
                      <p className="text-gray-900 font-medium">{patient.hbValue} g/dL</p>
                    </div>
                  )}
                  {(patient.bp_systolic || patient.bp_diastolic) && (
                    <div>
                      <label className="text-xs text-gray-500">Blood Pressure</label>
                      <p className="text-gray-900 font-medium">
                        {patient.bp_systolic}/{patient.bp_diastolic} mmHg
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medical History Summary */}
            {patient.medicalHistory && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-50 border-b">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Medical History Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-gray-700 text-sm">{patient.medicalHistory}</p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardContent className="p-4 space-y-2 text-xs text-gray-500">
                {patient.createdByName && (
                  <p>
                    Created by: {patient.createdByName}
                    {patient.createdByEmail && ` (${patient.createdByEmail})`}
                  </p>
                )}
                <p>Created on: {formatDateTime(patient.createdAt)}</p>
                <p>Last updated: {formatDateTime(patient.updatedAt)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}