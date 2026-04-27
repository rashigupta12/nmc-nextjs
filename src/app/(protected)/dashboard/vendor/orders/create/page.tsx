/*eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/auth";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Barcode,
  CalendarIcon,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  FlaskConical,
  Loader2,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

interface Patient {
  id: string;
  patientId: string;
  patientFName: string;
  patientLName: string;
  age: string;
  gender: string;
  email: string;
  mobileNo: string;
  mrno?: string;
}

interface SubTest {
  id: string;
  name: string;
}

interface Test {
  id: string;
  name: string;
  subTests: SubTest[];
}

interface OrderFormData {
  patientId: string;
  testCode: string;
  subtests: string[];
  kitBarcode: string;
  customerSampleId: string;
  sampleType: string;
  collectionDate: Date;
  collectionTime: string;
  remark: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function CreateOrderPage() {
  const user = useCurrentUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedSubtests, setSelectedSubtests] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const [formData, setFormData] = useState<OrderFormData>({
    patientId: "",
    testCode: "",
    subtests: [],
    kitBarcode: "",
    customerSampleId: "",
    sampleType: "SALIVA",
    collectionDate: new Date(),
    collectionTime: "12:00",
    remark: "",
  });

  // Search patients
  const searchPatients = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setPatients([]);
      setShowPatientDropdown(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setPatients(data.patients || []);
        setShowPatientDropdown(true);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      setPatients([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        searchPatients(searchTerm);
      } else {
        setPatients([]);
        setShowPatientDropdown(false);
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".patient-search-container")) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Fetch tests
  const fetchTests = async () => {
    try {
      const res = await fetch('/api/test-catalog?isActive=true');
      const result = await res.json();

      if (result.success && result.data) {
        setTests(result.data);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      Swal.fire('Error', 'Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Handle test selection
  const handleTestChange = (testId: string) => {
    const test = tests.find((t) => t.id === testId);
    setSelectedTest(test || null);
    
    // Auto-select all subtests by default
    const allSubtestIds = test?.subTests.map(subtest => subtest.id) || [];
    setSelectedSubtests(allSubtestIds);
    
    setFormData({
      ...formData,
      testCode: testId,
      subtests: allSubtestIds,
    });
  };

  // Handle subtest toggle
  const handleSubtestToggle = (subtestId: string) => {
    setSelectedSubtests((prev) => {
      const newSubtests = prev.includes(subtestId)
        ? prev.filter((id) => id !== subtestId)
        : [...prev, subtestId];

      setFormData({
        ...formData,
        subtests: newSubtests,
      });

      return newSubtests;
    });
  };

  // Select/Deselect all subtests
  const handleSelectAllSubtests = () => {
    if (!selectedTest) return;
    
    const allSubtestIds = selectedTest.subTests.map(subtest => subtest.id);
    const allSelected = selectedSubtests.length === allSubtestIds.length && allSubtestIds.length > 0;
    
    if (allSelected) {
      setSelectedSubtests([]);
      setFormData({ ...formData, subtests: [] });
    } else {
      setSelectedSubtests(allSubtestIds);
      setFormData({ ...formData, subtests: allSubtestIds });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    if (!selectedPatient) {
      newErrors.push({ field: "patient", message: "Please select a patient" });
    }
    if (!selectedTest) {
      newErrors.push({ field: "test", message: "Please select a test" });
    }
    if (!formData.collectionDate) {
      newErrors.push({ field: "collectionDate", message: "Please select collection date" });
    }
    if (!formData.collectionTime) {
      newErrors.push({ field: "collectionTime", message: "Please select collection time" });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Submit order
  const handleSubmit = async () => {
    if (!validateForm()) {
      Swal.fire("Validation Error", "Please fill all required fields", "error");
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        patientId: selectedPatient?.patientId,
        patientName: `${selectedPatient?.patientFName} ${selectedPatient?.patientLName}`,
        test: selectedTest?.id,
        subtests: selectedSubtests,
        kitBarcode: formData.kitBarcode,
        customerSampleId: formData.customerSampleId,
        sampleType: formData.sampleType,
        collectionDate: format(formData.collectionDate, "yyyy-MM-dd"),
        collectionTime: formData.collectionTime + ":00",
        addedBy: user?.email || user?.name || "system",
        vendorId: "ece454b1-7035-421d-9b35-1f5253d2ead9",
        createdBy: user?.id,
        remark: formData.remark,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();

      if (res.ok && result.Success === "true") {
        Swal.fire({
          title: "Order Created Successfully!",
          html: `
            <div class="text-left space-y-3">
              <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <p class="font-semibold text-blue-600 text-lg">${result.Result.order.orderNo}</p>
                <p class="text-sm text-gray-600 mt-1">Sample ID: ${result.Result.sample.sampleId}</p>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="bg-gray-50 p-2 rounded">
                  <span class="text-gray-500">Patient:</span>
                  <p class="font-medium">${selectedPatient?.patientFName} ${selectedPatient?.patientLName}</p>
                </div>
                <div class="bg-gray-50 p-2 rounded">
                  <span class="text-gray-500">Test:</span>
                  <p class="font-medium">${selectedTest?.name}</p>
                </div>
                <div class="bg-gray-50 p-2 rounded">
                  <span class="text-gray-500">Collection:</span>
                  <p>${format(formData.collectionDate, "PPP")}</p>
                </div>
                <div class="bg-gray-50 p-2 rounded">
                  <span class="text-gray-500">TAT Date:</span>
                  <p>${result.Result.sample.tatDate}</p>
                </div>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Print Order",
          showCancelButton: true,
          cancelButtonText: "Create Another",
        }).then((swalResult) => {
          if (swalResult.isConfirmed) {
            window.open(`/orders/${result.Result.order.orderNo}/print`, "_blank");
          }
          resetForm();
        });
      } else {
        throw new Error(result.Error || "Failed to create order");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      Swal.fire("Error", error.message || "Failed to create order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedTest(null);
    setSelectedSubtests([]);
    setSearchTerm("");
    setPatients([]);
    setFormData({
      patientId: "",
      testCode: "",
      subtests: [],
      kitBarcode: "",
      customerSampleId: "",
      sampleType: "SALIVA",
      collectionDate: new Date(),
      collectionTime: "12:00",
      remark: "",
    });
    setErrors([]);
    setShowPatientDropdown(false);
  };

  const sampleTypes = [
    { value: "SALIVA", label: "Saliva" },
    { value: "BLOOD", label: "Blood" },
    { value: "TISSUE", label: "Tissue" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
      <div className="mx-auto ">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/vendor/orders" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Order</h1>
            <p className="text-gray-600">Create a new test order by selecting patient and test details</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection Card */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-blue-600" />
                  Patient Information
                </CardTitle>
                <CardDescription>Search and select a patient from the system</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {selectedPatient ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {selectedPatient.patientFName} {selectedPatient.patientLName}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            {selectedPatient.patientId}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Age:</span>
                            <p className="font-medium">{selectedPatient.age}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Gender:</span>
                            <p className="font-medium">{selectedPatient.gender}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Email:</span>
                            <p className="font-medium truncate">{selectedPatient.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Mobile:</span>
                            <p className="font-medium">{selectedPatient.mobileNo}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPatient(null)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 patient-search-container relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by Patient ID, Name, Email, or Mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        autoComplete="off"
                      />
                      {searching && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>

                    {showPatientDropdown && patients.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                        {patients.map((patient) => (
                          <div
                            key={patient.id}
                            className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setSearchTerm("");
                              setPatients([]);
                              setShowPatientDropdown(false);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {patient.patientFName} {patient.patientLName}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {patient.patientId} • Age: {patient.age} • {patient.gender}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {patient.email} • {patient.mobileNo}
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="text-blue-600">
                                Select
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {errors.some((e) => e.field === "patient") && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Please select a patient
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Selection Card */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <ClipboardList className="h-5 w-5 text-green-600" />
                  Test Selection
                </CardTitle>
                <CardDescription>Select the primary test and any required subtests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label className="text-gray-700 font-semibold">Select Test *</Label>
                  <Select onValueChange={handleTestChange} value={selectedTest?.id}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Choose a test from the catalog..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tests.map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{test.name}</span>
                            {test.subTests && test.subTests.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {test.subTests.length} subtest(s) available
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.some((e) => e.field === "test") && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Please select a test
                    </p>
                  )}
                </div>

                {/* Subtests Section */}
                {selectedTest && selectedTest.subTests.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-purple-600" />
                        Subtests
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAllSubtests}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        {selectedSubtests.length === selectedTest.subTests.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTest.subTests.map((subtest) => (
                        <label
                          key={subtest.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubtests.includes(subtest.id)}
                            onChange={() => handleSubtestToggle(subtest.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm">{subtest.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedSubtests.length} of {selectedTest.subTests.length} selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sample Information Card */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FlaskConical className="h-5 w-5 text-purple-600" />
                  Sample Information
                </CardTitle>
                <CardDescription>Provide sample collection details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label>Sample Type *</Label>
                  <Select
                    value={formData.sampleType}
                    onValueChange={(value) => setFormData({ ...formData, sampleType: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">Collection Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal mt-1.5 ${
                            !formData.collectionDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.collectionDate ? format(formData.collectionDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.collectionDate}
                          onSelect={(date) =>
                            setFormData({ ...formData, collectionDate: date || new Date() })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.some((e) => e.field === "collectionDate") && (
                      <p className="text-sm text-red-600 mt-1">Collection date is required</p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">Collection Time *</Label>
                    <Input
                      type="time"
                      value={formData.collectionTime}
                      onChange={(e) => setFormData({ ...formData, collectionTime: e.target.value })}
                      className="mt-1.5"
                    />
                    {errors.some((e) => e.field === "collectionTime") && (
                      <p className="text-sm text-red-600 mt-1">Collection time is required</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Kit Barcode</Label>
                    <Input
                      placeholder="Optional"
                      value={formData.kitBarcode}
                      onChange={(e) => setFormData({ ...formData, kitBarcode: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Customer Sample ID</Label>
                    <Input
                      placeholder="Optional"
                      value={formData.customerSampleId}
                      onChange={(e) => setFormData({ ...formData, customerSampleId: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label>Remarks</Label>
                  <Textarea
                    placeholder="Any additional notes or special instructions..."
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Panel - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border border-gray-200 border-t-4 border-t-blue-500">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Order Summary
                  </CardTitle>
                  <CardDescription>Review all details before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {/* Patient Summary */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-500 uppercase">Patient Details</h4>
                    {selectedPatient ? (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        <p className="font-medium text-gray-900">
                          {selectedPatient.patientFName} {selectedPatient.patientLName}
                        </p>
                        <p className="text-xs text-gray-500">{selectedPatient.patientId}</p>
                        <p className="text-xs text-gray-500">
                          {selectedPatient.age} yrs • {selectedPatient.gender}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{selectedPatient.email}</p>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg">
                        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No patient selected</p>
                      </div>
                    )}
                  </div>

                  {/* Test Summary */}
                  {selectedTest && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-500 uppercase">Test Details</h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        <p className="font-medium text-gray-900">{selectedTest.name}</p>
                        {selectedSubtests.length > 0 && (
                          <>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                              Subtests ({selectedSubtests.length}):
                            </p>
                            <ul className="text-xs space-y-1 mt-1 max-h-32 overflow-y-auto">
                              {selectedSubtests.map((id) => {
                                const subtest = selectedTest.subTests.find((s) => s.id === id);
                                return subtest ? (
                                  <li key={id} className="text-gray-600">
                                    • {subtest.name}
                                  </li>
                                ) : null;
                              })}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sample Summary */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-500 uppercase">Sample Details</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      <p className="text-sm">
                        <span className="text-gray-500">Type:</span>{" "}
                        <span className="font-medium">{formData.sampleType}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Collection:</span>{" "}
                        {formData.collectionDate ? format(formData.collectionDate, "PPP") : "-"} at {formData.collectionTime}
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedPatient || !selectedTest}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Order
                      </>
                    )}
                  </Button>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800 text-center">
                      ⚠️ By creating this order, you confirm that all information is accurate
                      and patient consent has been obtained.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}