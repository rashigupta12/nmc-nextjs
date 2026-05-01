/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity, AlertCircle, ArrowLeft, Calendar, CheckCircle, CheckCircle2,
  Clock, FileText, FlaskConical, Loader2, Mail, Package, Phone, Save,
  Truck, Upload, User, XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Sample {
  reportGeneratedAt: any;
  releasedAt: any;
  addedBy: import("react").JSX.Element;
  id: string;
  sampleId: string;
  nmcgId: string | null;
  partnerSampleId: string | null;
  kitBarcode: string;
  sampleType: string;
  status: string;
  tatDueAt: string | null;
  dateSampleTaken: string;
  sampleTime: string;
  subtests: string[];
  csvUploaded: boolean;
  csvValidated: boolean;
  validationSummary: any;
  reportGenerated: boolean;
  reportReleased: boolean;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  patient?: Patient;
  testCatalog?: Test;
  vendor?: Vendor;
  subtestsDetails?: Test[];
}

interface Order {
  id: string; orderNo: string; shipmentStatus: string;
  paymentStatus: string; orderDate: string; remark: string | null;
}

interface Patient {
  id: string; patientId: string; patientFName: string; patientLName: string;
  age: string; gender: string; email: string; mobileNo: string;
  address?: { fullAddress?: string; city?: string; state?: string };
}

interface Test {
  id: string; testCode: string; testName: string; alias?: string;
  description: string | null; tatDays: number; price?: number;
}

interface Vendor { id: string; name: string; email: string; }

interface GeneticRow {
  conditionName: string;
  gene: string;
  uniqueId: string;
  genotype: string;
  /** Populated after successful validation */
  masterData?: {
    gene: string;
    condition_name: string;
    response: string;
    status: string;
    matchedVariant: string;
    matchType: string;
  };
  /** Set when the row failed validation */
  validationError?: string;
  /** UI-only: tracks whether this row has been manually corrected */
  corrected?: boolean;
}

type UploadPhase = "idle" | "uploading" | "review" | "saving" | "saved";

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SampleDetailsPage() {
  const params = useParams();
  const sampleId = params.sampleId as string;

  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload & review state
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [uploadMeta, setUploadMeta] = useState<{
    testId: string; testCode: string; testReportName: string; patientId: string;
  } | null>(null);
  const [rows, setRows] = useState<GeneticRow[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSampleDetails(); }, [sampleId]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchSampleDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vendor/samples/${sampleId}`);
      const data = await res.json();
      if (data.success) setSample(data.data);
      else Swal.fire("Error", data.error || "Failed to load sample details", "error");
    } catch {
      Swal.fire("Error", "Failed to load sample details", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── File select ────────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      Swal.fire("Error", "Please upload a CSV file", "error");
      return;
    }
    setSelectedFile(file);
    // Reset any previous review
    setPhase("idle");
    setRows([]);
  };

  // ── Upload (validate only) ─────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return Swal.fire("Error", "Please select a file first", "error");
    if (!sample?.testCatalog?.testCode) return Swal.fire("Error", "Test type not found", "error");

    setPhase("uploading");

    const formData = new FormData();
    formData.append("csvFile", selectedFile);
    formData.append("testType", sample.testCatalog.testCode);

    try {
      const res = await fetch(`/api/vendor/samples/${sampleId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPhase("idle");
        Swal.fire("Upload Failed", data.error || data.message || "Unknown error", "error");
        return;
      }

      // Merge valid + invalid rows into one flat table for review
      const { validationResults, testId, testCode, testReportName, patientId } = data.data;

      const allRows: GeneticRow[] = [
        ...validationResults.validData.map((r: any) => ({
          conditionName: r.conditionName,
          gene: r.gene,
          uniqueId: r.uniqueId,
          genotype: r.genotype,
          masterData: r.masterData,
          corrected: false,
        })),
        ...validationResults.invalidData.map((r: any) => ({
          conditionName: r.conditionName,
          gene: r.gene,
          uniqueId: r.uniqueId,
          genotype: r.genotype,
          validationError: r.validationError,
          corrected: false,
        })),
      ];

      setRows(allRows);
      setValidCount(validationResults.validRecords);
      setInvalidCount(validationResults.invalidRecords);
      setUploadMeta({ testId, testCode, testReportName, patientId });
      setPhase("review");
    } catch {
      setPhase("idle");
      Swal.fire("Error", "Failed to upload CSV file", "error");
    }
  };

  // ── Inline edit ────────────────────────────────────────────────────────────

  const updateRow = (index: number, field: keyof GeneticRow, value: string) => {
    setRows(prev =>
      prev.map((r, i) =>
        i === index ? { ...r, [field]: value, corrected: true } : r
      )
    );
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    // ✅ FIX: Check if uploadMeta exists
    if (!uploadMeta) {
      return Swal.fire("Error", "No upload data found. Please upload the CSV again.", "error");
    }

    const stillInvalid = rows.filter(r => r.validationError && !r.corrected);
    if (stillInvalid.length > 0) {
      const confirm = await Swal.fire({
        title: "Invalid rows remain",
        text: `${stillInvalid.length} row(s) still have errors and will be skipped. Save valid rows only?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Save valid rows",
        cancelButtonText: "Go back and fix",
      });
      if (!confirm.isConfirmed) return;
    }

    const recordsToSave = rows.filter(r => !r.validationError || r.corrected);

    if (recordsToSave.length === 0) {
      return Swal.fire("Nothing to save", "No valid records to save.", "warning");
    }

    setPhase("saving");

    try {
      // ✅ FIX: Include patientId in the request body
      const res = await fetch(`/api/vendor/samples/${sampleId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: uploadMeta.patientId,  // ✅ Added patientId
          testId: uploadMeta.testId,
          testCode: uploadMeta.testCode,
          testReportName: uploadMeta.testReportName,
          records: recordsToSave,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPhase("saved");
        Swal.fire({
          title: "Saved!",
          html: `<p>${data.data.recordsSaved} records saved. Sample status → <strong>PROCESSING</strong>.</p>`,
          icon: "success",
        });
        fetchSampleDetails();
        // Reset upload UI
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setRows([]);
        setPhase("idle");
      } else {
        setPhase("review");
        Swal.fire("Save Failed", data.error || "Unknown error", "error");
      }
    } catch {
      setPhase("review");
      Swal.fire("Error", "Failed to save records", "error");
    }
  };

  // ── Status badge ───────────────────────────────────────────────────────────

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      CREATED: { label: "Created", className: "bg-gray-100 text-gray-800", icon: Clock },
      SHIPPED: { label: "Shipped", className: "bg-blue-100 text-blue-800", icon: Truck },
      RECEIVED: { label: "Received", className: "bg-purple-100 text-purple-800", icon: Package },
      QC_PASSED: { label: "QC Passed", className: "bg-green-100 text-green-800", icon: CheckCircle },
      QC_FAILED: { label: "QC Failed", className: "bg-red-100 text-red-800", icon: XCircle },
      PROCESSING: { label: "Processing", className: "bg-yellow-100 text-yellow-800", icon: Activity },
      READY: { label: "Ready", className: "bg-indigo-100 text-indigo-800", icon: CheckCircle2 },
      REPORT_GENERATED: { label: "Report Generated", className: "bg-emerald-100 text-emerald-800", icon: FileText },
      RELEASED: { label: "Released", className: "bg-teal-100 text-teal-800", icon: CheckCircle2 },
      RESAMPLING: { label: "Resampling", className: "bg-orange-100 text-orange-800", icon: AlertCircle },
    };
    const { label, className, icon: Icon } = config[status] || {
      label: status, className: "bg-gray-100 text-gray-800", icon: Activity,
    };
    return (
      <Badge className={`${className} flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" /> {label}
      </Badge>
    );
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const formatDateTime = (d: string) => new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  // ── Loading / not found ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Sample Not Found</h2>
        <p className="text-gray-500 mt-2">The sample you're looking for doesn't exist.</p>
        <Button asChild className="mt-6">
          <Link href="/business/dashboard/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const isReviewing = phase === "review" || phase === "saving";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
      <div className="mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/business/dashboard/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sample {sample.sampleId}</h1>
              <p className="text-sm text-gray-500 mt-1">Created {formatDateTime(sample.createdAt)}</p>
            </div>
            {getStatusBadge(sample.status)}
          </div>
        </div>

        {/* Two-column info layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Patient */}
          {sample.patient && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-4 w-4 text-green-600" /> Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Full Name</Label>
                    <p className="text-sm font-medium mt-0.5">
                      {sample.patient.patientFName} {sample.patient.patientLName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Patient ID</Label>
                    <p className="text-sm font-mono mt-0.5">{sample.patient.patientId}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Age / Gender</Label>
                    <p className="text-sm mt-0.5">
                      {sample.patient.age} yrs •{" "}
                      {sample.patient.gender === "M" ? "Male" : sample.patient.gender === "F" ? "Female" : sample.patient.gender}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Contact</Label>
                    <p className="text-sm mt-0.5 flex items-center gap-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {sample.patient.email || "Not provided"}
                    </p>
                    {sample.patient.mobileNo && (
                      <p className="text-sm mt-0.5 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {sample.patient.mobileNo}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="h-4 w-4 text-blue-600" /> Test Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sample.testCatalog ? (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-base">{sample.testCatalog.testName}</p>
                        {sample.testCatalog.alias && (
                          <Badge variant="outline" className="text-xs">{sample.testCatalog.alias}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Code: {sample.testCatalog.testCode}</p>
                      {sample.testCatalog.description && (
                        <p className="text-sm text-gray-600 mt-2">{sample.testCatalog.description}</p>
                      )}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">TAT: {sample.testCatalog.tatDays} days</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">No test details available</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">Sample Type</Label>
                  <p className="text-sm font-medium mt-0.5 capitalize">{sample.sampleType?.toLowerCase()}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Collection Date</Label>
                  <p className="text-sm mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {formatDate(sample.dateSampleTaken)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Collection Time</Label>
                  <p className="text-sm mt-0.5">
                    {sample.sampleTime
                      ? new Date(`2000-01-01T${sample.sampleTime}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">TAT Due Date</Label>
                  <p className="text-sm mt-0.5">{sample.tatDueAt ? formatDate(sample.tatDueAt) : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Upload Card ───────────────────────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-4 w-4 text-amber-600" /> Genetic Data Upload
            </CardTitle>
            <CardDescription className="text-xs">
              Upload a CSV, review the validated data, fix any errors, then click Save.
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Existing upload status (from DB) */}
            {sample.csvUploaded && phase === "idle" && (
              <Alert className={`mb-4 p-3 ${sample.csvValidated ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                {sample.csvValidated
                  ? <CheckCircle className="h-3 w-3 text-green-600" />
                  : <AlertCircle className="h-3 w-3 text-red-600" />
                }
                <AlertDescription className="text-xs ml-2">
                  {sample.csvValidated ? "A CSV has been uploaded and validated for this sample." : "A previous CSV upload failed validation."}
                </AlertDescription>
              </Alert>
            )}

            {/* File picker + upload button (hidden during review) */}
            {!isReviewing && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center mb-4">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 mb-3">
                  Required columns: <span className="font-mono">condition name, genes, uniqueid, genotype</span>
                </p>

                <Input
                  id="csvFileInput"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="mb-3 text-sm"
                />

                {selectedFile && (
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded mb-3 text-xs">
                    <span className="font-medium truncate">{selectedFile.name}</span>
                    <Badge variant="outline">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || phase === "uploading"}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {phase === "uploading" ? (
                    <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> Validating…</>
                  ) : (
                    <><Upload className="h-3 w-3 mr-2" /> Validate CSV</>
                  )}
                </Button>
              </div>
            )}

            {/* ── Validation Summary ─────────────────────────────────────── */}
            {isReviewing && (
              <>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-800">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {validCount} valid
                  </div>
                  {invalidCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-800">
                      <XCircle className="h-3.5 w-3.5" />
                      {invalidCount} invalid — edit below to fix
                    </div>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">
                    {rows.length} total rows from <span className="font-mono font-medium">{selectedFile?.name}</span>
                  </span>
                </div>

                {/* ── Editable Table ─────────────────────────────────────── */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600 w-8">#</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Condition</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Gene</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Unique ID</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Genotype</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Report Variant</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Response</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => {
                        const hasError = !!row.validationError;
                        const isCorrected = row.corrected && !row.validationError;
                        return (
                          <tr
                            key={i}
                            className={[
                              "border-b border-gray-100 transition-colors",
                              hasError ? "bg-red-50 hover:bg-red-100" : "",
                              isCorrected ? "bg-amber-50 hover:bg-amber-100" : "",
                              !hasError && !isCorrected ? "hover:bg-gray-50" : "",
                            ].join(" ")}
                          >
                            {/* Row number */}
                            <td className="px-3 py-2 text-gray-400 font-mono">{i + 1}</td>

                            {/* Condition (editable if invalid) */}
                            <td className="px-3 py-2">
                              {hasError ? (
                                <input
                                  className="w-full bg-white border border-red-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                                  value={row.conditionName}
                                  onChange={e => updateRow(i, "conditionName", e.target.value)}
                                />
                              ) : (
                                <span className="text-gray-800">{row.conditionName}</span>
                              )}
                            </td>

                            {/* Gene (editable if invalid) */}
                            <td className="px-3 py-2">
                              {hasError ? (
                                <input
                                  className="w-full bg-white border border-red-300 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-red-400"
                                  value={row.gene}
                                  onChange={e => updateRow(i, "gene", e.target.value)}
                                />
                              ) : (
                                <span className="font-mono text-gray-800">{row.masterData?.gene ?? row.gene}</span>
                              )}
                            </td>

                            {/* Unique ID (read-only — must match master) */}
                            <td className="px-3 py-2 font-mono text-gray-700">{row.uniqueId}</td>

                            {/* Genotype (editable if invalid) */}
                            <td className="px-3 py-2">
                              {hasError ? (
                                <input
                                  className="w-full bg-white border border-red-300 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-red-400"
                                  value={row.genotype}
                                  onChange={e => updateRow(i, "genotype", e.target.value)}
                                />
                              ) : (
                                <span className="font-mono text-gray-800">{row.genotype}</span>
                              )}
                            </td>

                            {/* Report variant (from master — read-only) */}
                            <td className="px-3 py-2 font-mono text-gray-600">
                              {row.masterData?.matchedVariant ?? (hasError ? <span className="text-red-400">—</span> : "—")}
                            </td>

                            {/* Response */}
                            <td className="px-3 py-2 text-gray-600">
                              {row.masterData?.response ?? (hasError ? <span className="text-red-400">—</span> : "—")}
                            </td>

                            {/* Status badge */}
                            <td className="px-3 py-2">
                              {hasError ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                                    <XCircle className="h-3 w-3" /> Invalid
                                  </span>
                                  <p className="text-red-500 mt-1 text-[10px] leading-tight max-w-[160px]">
                                    {row.validationError}
                                  </p>
                                </div>
                              ) : isCorrected ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                  Corrected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                                  <CheckCircle className="h-3 w-3" /> Valid
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPhase("idle");
                      setRows([]);
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <ArrowLeft className="h-3 w-3 mr-2" /> Upload different file
                  </Button>

                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={phase === "saving"}
                    onClick={handleSave}
                  >
                    {phase === "saving" ? (
                      <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> Saving…</>
                    ) : (
                      <><Save className="h-3 w-3 mr-2" /> Save {validCount} valid record{validCount !== 1 ? "s" : ""}</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}