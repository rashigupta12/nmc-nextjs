/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  FlaskConical,
  Loader2,
  Package,
  Truck,
  Upload,
  User,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Barcode,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

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
  id: string;
  orderNo: string;
  shipmentStatus: string;
  paymentStatus: string;
  orderDate: string;
  remark: string | null;
}

interface Patient {
  id: string;
  patientId: string;
  patientFName: string;
  patientLName: string;
  age: string;
  gender: string;
  email: string;
  mobileNo: string;
}

interface Test {
  id: string;
  testCode: string;
  testName: string;
  description: string | null;
  tatDays: number;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
}

export default function SampleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sampleId = params.sampleId as string;

  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSampleDetails();
  }, [sampleId]);

  const fetchSampleDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vendor/samples/${sampleId}`);
      const data = await res.json();

      if (data.success) {
        setSample(data.data);
      } else {
        Swal.fire(
          "Error",
          data.error || "Failed to load sample details",
          "error",
        );
      }
    } catch (error) {
      console.error("Error fetching sample:", error);
      Swal.fire("Error", "Failed to load sample details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        Swal.fire("Error", "Please upload a CSV file", "error");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Swal.fire("Error", "Please select a file first", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`/api/vendor/samples/${sampleId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Swal.fire({
          title: "Success!",
          html: `
            <div class="text-left">
              <p>CSV file uploaded successfully!</p>
              <p class="text-sm text-gray-600 mt-2">Rows processed: ${data.data.rowCount}</p>
              <p class="text-sm text-gray-600">Columns: ${data.data.columnCount}</p>
            </div>
          `,
          icon: "success",
        });
        setSelectedFile(null);
        fetchSampleDetails(); // Refresh data
      } else {
        const errorMsg =
          data.error ||
          data.validationSummary?.errors?.join("\n") ||
          "Upload failed";
        Swal.fire({
          title: "Upload Failed",
          html: `<pre class="text-left text-sm">${errorMsg}</pre>`,
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error uploading:", error);
      Swal.fire("Error", "Failed to upload CSV file", "error");
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { label: string; className: string; icon: any }
    > = {
      CREATED: {
        label: "Created",
        className: "bg-gray-100 text-gray-800",
        icon: Clock,
      },
      SHIPPED: {
        label: "Shipped",
        className: "bg-blue-100 text-blue-800",
        icon: Truck,
      },
      RECEIVED: {
        label: "Received",
        className: "bg-purple-100 text-purple-800",
        icon: Package,
      },
      QC_PASSED: {
        label: "QC Passed",
        className: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      QC_FAILED: {
        label: "QC Failed",
        className: "bg-red-100 text-red-800",
        icon: XCircle,
      },
      PROCESSING: {
        label: "Processing",
        className: "bg-yellow-100 text-yellow-800",
        icon: Activity,
      },
      READY: {
        label: "Ready",
        className: "bg-indigo-100 text-indigo-800",
        icon: CheckCircle2,
      },
      REPORT_GENERATED: {
        label: "Report Generated",
        className: "bg-emerald-100 text-emerald-800",
        icon: FileText,
      },
      RELEASED: {
        label: "Released",
        className: "bg-teal-100 text-teal-800",
        icon: CheckCircle2,
      },
      RESAMPLING: {
        label: "Resampling",
        className: "bg-orange-100 text-orange-800",
        icon: AlertCircle,
      },
    };
    const {
      label,
      className,
      icon: Icon,
    } = config[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
      icon: Activity,
    };
    return (
      <Badge className={`${className} flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    };
    return <Badge className={config[status] || "bg-gray-100"}>{status}</Badge>;
  };

  const getShipmentStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CREATED: "bg-gray-100 text-gray-800",
      SHIPPED: "bg-blue-100 text-blue-800",
      IN_TRANSIT: "bg-purple-100 text-purple-800",
      RECEIVED: "bg-green-100 text-green-800",
      PARTIALLY_RECEIVED: "bg-orange-100 text-orange-800",
    };
    return <Badge className={config[status] || "bg-gray-100"}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <h2 className="text-xl font-semibold text-gray-900">
          Sample Not Found
        </h2>
        <p className="text-gray-500 mt-2">
          The sample you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/vendor/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/vendor/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sample Details
              </h1>
              <p className="text-gray-600">
                View and manage sample information
              </p>
            </div>
            <div className="flex gap-2">
              {sample.reportGenerated && (
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              )}
              <Button
                asChild
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Link href={`/dashboard/vendor/orders/${sample.order?.id}`}>
                  View Order Details
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="genetic-data">Genetic Data</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Sample Information Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="h-5 w-5 text-blue-600" />
                      Sample Information
                    </CardTitle>
                    <CardDescription>Sample details and status</CardDescription>
                  </div>
                  {getStatusBadge(sample.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-xs text-gray-500">Sample ID</Label>
                    <p className="font-mono text-sm font-medium mt-1">
                      {sample.sampleId}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Kit Barcode</Label>
                    <p className="font-mono text-sm mt-1">
                      {sample.kitBarcode || "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Sample Type</Label>
                    <p className="text-sm font-medium mt-1">
                      {sample.sampleType}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      Collection Date
                    </Label>
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {formatDate(sample.dateSampleTaken)} at{" "}
                      {sample.sampleTime}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      TAT Due Date
                    </Label>
                    <p className="text-sm mt-1">
                      {sample.tatDueAt ? formatDate(sample.tatDueAt) : "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Created At</Label>
                    <p className="text-sm mt-1">
                      {formatDateTime(sample.createdAt)}
                    </p>
                  </div>
                </div>

                {sample.subtests && sample.subtests.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <Label className="text-sm font-semibold">
                      Subtests Included
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sample.subtestsDetails?.map((subtest) => (
                        <Badge
                          key={subtest.id}
                          variant="outline"
                          className="bg-gray-50"
                        >
                          {subtest.testName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient Information Card */}
            {sample.patient && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-xs text-gray-500">Full Name</Label>
                      <p className="text-sm font-medium mt-1">
                        {sample.patient.patientFName}{" "}
                        {sample.patient.patientLName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">
                        Patient ID
                      </Label>
                      <p className="text-sm mt-1">{sample.patient.patientId}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">
                        Age / Gender
                      </Label>
                      <p className="text-sm mt-1">
                        {sample.patient.age} yrs • {sample.patient.gender}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <p className="text-sm mt-1 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {sample.patient.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Mobile</Label>
                      <p className="text-sm mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {sample.patient.mobileNo || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Information Card */}
            {sample.order && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-xs text-gray-500">
                        Order Number
                      </Label>
                      <p className="font-mono text-sm font-medium mt-1">
                        {sample.order.orderNo}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">
                        Order Date
                      </Label>
                      <p className="text-sm mt-1">
                        {formatDate(sample.order.orderDate)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">
                        Shipment Status
                      </Label>
                      <div className="mt-1">
                        {getShipmentStatusBadge(sample.order.shipmentStatus)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">
                        Payment Status
                      </Label>
                      <div className="mt-1">
                        {getPaymentStatusBadge(sample.order.paymentStatus)}
                      </div>
                    </div>
                    {sample.order.remark && (
                      <div className="col-span-full">
                        <Label className="text-xs text-gray-500">Remarks</Label>
                        <p className="text-sm mt-1 text-gray-600">
                          {sample.order.remark}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Genetic Data Tab */}
          <TabsContent value="genetic-data" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Genetic Data Upload
                </CardTitle>
                <CardDescription>
                  Upload CSV file containing genetic data for this sample
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Upload Status */}
                {sample.csvUploaded && (
                  <Alert
                    className={`mb-6 ${sample.csvValidated ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                  >
                    {sample.csvValidated ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      {sample.csvValidated
                        ? "CSV file has been successfully uploaded and validated."
                        : "CSV file uploaded but validation failed. Please check the errors below."}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Validation Summary */}
                {sample.validationSummary && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Validation Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Rows:</span>
                        <span className="ml-2 font-medium">
                          {sample.validationSummary.rowCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Columns:</span>
                        <span className="ml-2 font-medium">
                          {sample.validationSummary.columnCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">File:</span>
                        <span className="ml-2 font-medium">
                          {sample.validationSummary.fileName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Uploaded:</span>
                        <span className="ml-2 font-medium">
                          {new Date(
                            sample.validationSummary.uploadedAt,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {sample.validationSummary.warnings?.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                          Warnings:
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {sample.validationSummary.warnings.map(
                            (warning: string, idx: number) => (
                              <li key={idx}>• {warning}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {sample.validationSummary.errors?.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-red-800 mb-1">
                          Errors:
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {sample.validationSummary.errors.map(
                            (error: string, idx: number) => (
                              <li key={idx}>• {error}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Form */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Upload CSV File
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload a CSV file containing genetic data for this sample
                  </p>

                  <div className="max-w-md mx-auto">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="mb-3"
                    />
                    {selectedFile && (
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-3">
                        <span className="text-sm font-medium">
                          {selectedFile.name}
                        </span>
                        <Badge variant="outline">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </Badge>
                      </div>
                    )}
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload CSV
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* CSV Format Guide */}
                {/* CSV Format Guide */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV Format Requirements
                  </h4>
                  <div className="text-sm text-blue-800 space-y-3">
                    <p>Required columns (exact names):</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <code className="bg-blue-100 px-1 rounded">
                          condition name
                        </code>{" "}
                        - Medical condition category (e.g., Renal genes, Cardiac
                        Genes)
                      </li>
                      <li>
                        <code className="bg-blue-100 px-1 rounded">genes</code>{" "}
                        - Gene name (e.g., WNK1a, ADRB2)
                      </li>
                      <li>
                        <code className="bg-blue-100 px-1 rounded">
                          uniqueid
                        </code>{" "}
                        - Unique identifier matching Sample ID
                      </li>
                      <li>
                        <code className="bg-blue-100 px-1 rounded">
                          genotype
                        </code>{" "}
                        - Genotype result (e.g., CC, AG, TT)
                      </li>
                    </ul>

                    <div className="mt-3">
                      <p className="font-semibold text-blue-900 mb-1">
                        Example CSV format:
                      </p>
                      <pre className="bg-blue-100 p-2 rounded text-xs overflow-x-auto">
                        {`condition name,genes,uniqueid,genotype
Renal genes,WNK1a,rs1159744,CC
Renal genes,SLC12A3,rs1529927,CC
Cardiac Genes,ADRB2 16,rs1042713,AG
Vascular Genes,Renin,rs12750834,AG`}
                      </pre>
                    </div>

                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs text-yellow-800">
                        💡 <span className="font-semibold">Important:</span>{" "}
                        Column names are case-sensitive. Use exactly:{" "}
                        <code className="bg-yellow-100 px-1 rounded">
                          condition name
                        </code>
                        ,
                        <code className="bg-yellow-100 px-1 rounded">
                          genes
                        </code>
                        ,
                        <code className="bg-yellow-100 px-1 rounded">
                          uniqueid
                        </code>
                        ,
                        <code className="bg-yellow-100 px-1 rounded">
                          genotype
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Sample Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                  <div className="space-y-6">
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Sample Created
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(sample.createdAt)}
                        </p>
                        {sample.addedBy && (
                          <p className="text-xs text-gray-400">
                            Added by: {sample.addedBy}
                          </p>
                        )}
                      </div>
                    </div>

                    {sample.csvUploaded && (
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Upload className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            CSV Uploaded
                          </p>
                          <p className="text-sm text-gray-500">
                            {sample.validationSummary?.uploadedAt
                              ? formatDateTime(
                                  sample.validationSummary.uploadedAt,
                                )
                              : "Upload completed"}
                          </p>
                          {sample.csvValidated && (
                            <Badge className="mt-1 bg-green-100 text-green-800">
                              Validated
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {sample.reportGenerated && (
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Report Generated
                          </p>
                          <p className="text-sm text-gray-500">
                            {sample.reportGeneratedAt
                              ? formatDateTime(sample.reportGeneratedAt)
                              : "Report ready"}
                          </p>
                        </div>
                      </div>
                    )}

                    {sample.reportReleased && (
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Report Released
                          </p>
                          <p className="text-sm text-gray-500">
                            {sample.releasedAt
                              ? formatDateTime(sample.releasedAt)
                              : "Report released to patient"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
