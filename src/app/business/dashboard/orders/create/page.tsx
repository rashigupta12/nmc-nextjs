/*eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(protected)/business/dashboard/orders/create/page.tsx
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
import { format, isToday, startOfDay } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  CalendarIcon,
  CheckCircle,
  ClipboardList,
  FlaskConical,
  Loader2,
  Search,
  User,
  Users,
  X,
  Package,
  Clock,
  Mail,
  Phone,
  Calendar as CalendarIcon2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useCurrentUser();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedSubtests, setSelectedSubtests] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [dateError, setDateError] = useState<string>("");

  // Get current date and time for validation
  const currentDate = new Date();
  const currentTime = format(currentDate, "HH:mm");

  const [formData, setFormData] = useState<OrderFormData>({
    patientId: "",
    testCode: "",
    subtests: [],
    kitBarcode: "",
    customerSampleId: "",
    sampleType: "SALIVA",
    collectionDate: currentDate,
    collectionTime: currentTime,
    remark: "",
  });

  // Fetch patient by ID from API
  const fetchPatientById = useCallback(async (patientId: string) => {
    if (!patientId || patientId === "undefined" || patientId === "null") {
      console.error("Invalid patient ID:", patientId);
      return false;
    }

    setLoadingPatient(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      const data = await res.json();

      if (res.ok && data.success && data.patient) {
        const patient = data.patient;
        setSelectedPatient({
          id: patient.id,
          patientId: patient.patientId,
          patientFName: patient.patientFName,
          patientLName: patient.patientLName,
          age: patient.age || "",
          gender: patient.gender,
          email: patient.email,
          mobileNo: patient.mobileNo || "",
          mrno: patient.mrno,
        });
        return true;
      } else {
        console.error("Patient not found:", data);
        await Swal.fire({
          icon: "warning",
          title: "Patient Not Found",
          text: "Could not load the selected patient. Please search manually.",
        });
        return false;
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load patient details",
      });
      return false;
    } finally {
      setLoadingPatient(false);
    }
  }, []);

  // On mount: read patient from localStorage
  useEffect(() => {
    const loadPatientData = async () => {
      const storedPatient = localStorage.getItem("selectedPatient");
      const patientIdFromUrl = searchParams.get("patientId");
      const patientIdFromStorage = localStorage.getItem("selectedPatientId");

      if (storedPatient) {
        try {
          const patient = JSON.parse(storedPatient);
          if (patient && patient.id && patient.id !== "undefined") {
            setSelectedPatient(patient);
            localStorage.removeItem("selectedPatient");
            return;
          }
        } catch (error) {
          console.error("Error parsing stored patient:", error);
          localStorage.removeItem("selectedPatient");
        }
      }

      if (patientIdFromUrl && patientIdFromUrl !== "undefined" && patientIdFromUrl !== "null") {
        await fetchPatientById(patientIdFromUrl);
        return;
      }

      if (patientIdFromStorage && patientIdFromStorage !== "undefined" && patientIdFromStorage !== "null") {
        await fetchPatientById(patientIdFromStorage);
        localStorage.removeItem("selectedPatientId");
        return;
      }
    };

    loadPatientData();
  }, [searchParams, fetchPatientById]);

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
      if (searchTerm) searchPatients(searchTerm);
      else { setPatients([]); setShowPatientDropdown(false); }
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
      const res = await fetch("/api/test-catalog?isActive=true");
      const result = await res.json();
      if (result.success && result.data) setTests(result.data);
      else setTests([]);
    } catch (error) {
      console.error("Error fetching tests:", error);
      Swal.fire("Error", "Failed to load tests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleTestChange = (testId: string) => {
    const test = tests.find((t) => t.id === testId);
    setSelectedTest(test || null);
    const allSubtestIds = test?.subTests.map(s => s.id) || [];
    setSelectedSubtests(allSubtestIds);
    setFormData({ ...formData, testCode: testId, subtests: allSubtestIds });
  };

  const handleSubtestToggle = (subtestId: string) => {
    setSelectedSubtests((prev) => {
      const newSubtests = prev.includes(subtestId)
        ? prev.filter((id) => id !== subtestId)
        : [...prev, subtestId];
      setFormData({ ...formData, subtests: newSubtests });
      return newSubtests;
    });
  };

  const handleSelectAllSubtests = () => {
    if (!selectedTest) return;
    const allSubtestIds = selectedTest.subTests.map(s => s.id);
    const allSelected = selectedSubtests.length === allSubtestIds.length && allSubtestIds.length > 0;
    if (allSelected) {
      setSelectedSubtests([]);
      setFormData({ ...formData, subtests: [] });
    } else {
      setSelectedSubtests(allSubtestIds);
      setFormData({ ...formData, subtests: allSubtestIds });
    }
  };

  // Date validation function
  const validateCollectionDate = (date: Date | undefined): boolean => {
    if (!date) return false;
    const today = startOfDay(new Date());
    const selectedDate = startOfDay(date);
    
    if (selectedDate > today) {
      setDateError("Collection date cannot be in the future");
      return false;
    }
    setDateError("");
    return true;
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date && validateCollectionDate(date)) {
      setFormData({ ...formData, collectionDate: date });
    } else if (date && !validateCollectionDate(date)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "Collection date cannot be in the future. Please select today or a past date.",
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleTimeChange = (time: string) => {
    if (formData.collectionDate && isToday(formData.collectionDate)) {
      const [selectedHour, selectedMinute] = time.split(":").map(Number);
      const [currentHour, currentMinute] = currentTime.split(":").map(Number);
      
      if (selectedHour > currentHour || (selectedHour === currentHour && selectedMinute > currentMinute)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Time",
          text: "Collection time cannot be in the future for today's date. Please select current time or earlier.",
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
    }
    setFormData({ ...formData, collectionTime: time });
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];
    if (!selectedPatient) newErrors.push({ field: "patient", message: "Please select a patient" });
    if (!selectedTest) newErrors.push({ field: "test", message: "Please select a test" });
    if (!formData.collectionDate) newErrors.push({ field: "collectionDate", message: "Please select collection date" });
    if (!formData.collectionTime) newErrors.push({ field: "collectionTime", message: "Please select collection time" });
    
    if (formData.collectionDate && !validateCollectionDate(formData.collectionDate)) {
      newErrors.push({ field: "collectionDate", message: "Collection date cannot be in the future" });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Swal.fire("Validation Error", "Please fill all required fields correctly", "error");
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
        // Clear localStorage
        localStorage.removeItem("selectedPatient");
        localStorage.removeItem("selectedPatientId");

        // Show success message
        await Swal.fire({
          title: "Order Created Successfully!",
          text: `Order ${result.Result.order.orderNo} has been created.`,
          icon: "success",
          confirmButtonText: "View Orders",
          timer: 3000,
          timerProgressBar: true,
        });

        // Redirect to orders page
        router.push("/business/dashboard/orders");
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
      collectionDate: currentDate,
      collectionTime: currentTime,
      remark: "",
    });
    setErrors([]);
    setDateError("");
    setShowPatientDropdown(false);
    localStorage.removeItem("selectedPatient");
    localStorage.removeItem("selectedPatientId");
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    localStorage.removeItem("selectedPatient");
    localStorage.removeItem("selectedPatientId");
  };

  const sampleTypes = [
    { value: "SALIVA", label: "Saliva", icon: "💧" },
    { value: "BLOOD", label: "Blood", icon: "🩸" },
    { value: "TISSUE", label: "Tissue", icon: "🧬" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/business/dashboard/orders"
                className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Order</h1>
                <p className="text-xs text-gray-500">Select patient and test details</p>
              </div>
            </div>
          </div>
        </div>

        {loadingPatient ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading patient details...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Main Form - Left Column */}
            <div className="lg:col-span-2 space-y-4">

              {/* Patient Selection Card */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-3">
                  {selectedPatient ? (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-md p-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-sm">
                              {selectedPatient.patientFName} {selectedPatient.patientLName}
                            </span>
                            <Badge className="bg-blue-100 text-blue-800 text-[10px] px-1.5">
                              {selectedPatient.patientId}
                            </Badge>
                            {selectedPatient.mrno && (
                              <span className="text-xs text-gray-500">MR: {selectedPatient.mrno}</span>
                            )}
                          </div>
                          <div className="flex gap-3 text-xs">
                            <span>{selectedPatient.age || "N/A"} yrs • {selectedPatient.gender}</span>
                            <span className="truncate">{selectedPatient.email}</span>
                            {selectedPatient.mobileNo && <span>{selectedPatient.mobileNo}</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelectedPatient}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 patient-search-container relative">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                        <Input
                          placeholder="Search by ID, Name, Email, or Mobile..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 h-8 text-sm"
                          autoComplete="off"
                        />
                        {searching && (
                          <Loader2 className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 animate-spin text-gray-400" />
                        )}
                      </div>

                      {showPatientDropdown && patients.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {patients.map((patient) => (
                            <div
                              key={patient.id}
                              className="p-2 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
                              onClick={() => {
                                setSelectedPatient(patient);
                                setSearchTerm("");
                                setPatients([]);
                                setShowPatientDropdown(false);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {patient.patientFName} {patient.patientLName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {patient.patientId} • {patient.age || "N/A"} yrs • {patient.gender}
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className="text-blue-600 h-6 text-xs px-2">Select</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {errors.some((e) => e.field === "patient") && (
                        <p className="text-xs text-red-600">Please select a patient</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Test Selection Card */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ClipboardList className="h-4 w-4 text-green-600" />
                    Test Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-3 space-y-3">
                  <div>
                    <Select onValueChange={handleTestChange} value={selectedTest?.id}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select a test..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tests.map((test) => (
                          <SelectItem key={test.id} value={test.id}>
                            <div className="flex flex-col">
                              <span className="text-sm">{test.name}</span>
                              {test.subTests?.length > 0 && (
                                <span className="text-xs text-gray-500">{test.subTests.length} subtest(s)</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.some((e) => e.field === "test") && (
                      <p className="text-xs text-red-600 mt-1">Please select a test</p>
                    )}
                  </div>

                  {/* Subtests Section */}
                  {selectedTest && selectedTest.subTests.length > 0 && (
                    <div className="border border-gray-200 rounded-md p-2 space-y-1.5 bg-gray-50/50">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">
                          Subtests ({selectedSubtests.length}/{selectedTest.subTests.length})
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAllSubtests}
                          className="text-xs text-purple-600 h-6 px-2"
                        >
                          {selectedSubtests.length === selectedTest.subTests.length ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto">
                        {selectedTest.subTests.map((subtest) => (
                          <label key={subtest.id} className="flex items-center space-x-1.5 p-1 rounded hover:bg-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSubtests.includes(subtest.id)}
                              onChange={() => handleSubtestToggle(subtest.id)}
                              className="rounded border-gray-300 h-3 w-3"
                            />
                            <span className="text-xs">{subtest.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sample Information Card */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-purple-600" />
                    Sample Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">Sample Type *</Label>
                      <Select value={formData.sampleType} onValueChange={(value) => setFormData({ ...formData, sampleType: value })}>
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <span className="flex items-center gap-1.5 text-sm">
                                <span>{type.icon}</span> {type.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold">Kit Barcode</Label>
                      <Input
                        placeholder="Optional"
                        value={formData.kitBarcode}
                        onChange={(e) => setFormData({ ...formData, kitBarcode: e.target.value })}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <CalendarIcon2 className="h-3 w-3" />
                        Collection Date *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal mt-1 h-8 text-sm ${!formData.collectionDate && "text-muted-foreground"}`}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {formData.collectionDate ? format(formData.collectionDate, "MMM dd, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.collectionDate}
                            onSelect={handleDateChange}
                            initialFocus
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      {dateError && <p className="text-xs text-red-600 mt-0.5">{dateError}</p>}
                      {errors.some((e) => e.field === "collectionDate") && (
                        <p className="text-xs text-red-600 mt-0.5">Collection date is required</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Collection Time *
                      </Label>
                      <Input
                        type="time"
                        value={formData.collectionTime}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="mt-1 h-8 text-sm"
                        max={isToday(formData.collectionDate) ? currentTime : undefined}
                      />
                      {errors.some((e) => e.field === "collectionTime") && (
                        <p className="text-xs text-red-600 mt-0.5">Collection time is required</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Customer Sample ID</Label>
                    <Input
                      placeholder="Optional - Your reference ID"
                      value={formData.customerSampleId}
                      onChange={(e) => setFormData({ ...formData, customerSampleId: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Remarks</Label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      rows={2}
                      className="mt-1 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Panel - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Card className="border shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50/30 pb-2 pt-3 px-4">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-3 px-4 pb-3">
                    {/* Patient Summary */}
                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs text-gray-500 uppercase">Patient</h4>
                      {selectedPatient ? (
                        <div className="bg-gray-50 rounded-md p-2 space-y-0.5">
                          <p className="font-medium text-sm">
                            {selectedPatient.patientFName} {selectedPatient.patientLName}
                          </p>
                          <p className="text-xs text-gray-500">{selectedPatient.patientId}</p>
                          <p className="text-xs">{selectedPatient.age || "N/A"} yrs • {selectedPatient.gender}</p>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-gray-400 bg-gray-50 rounded-md">
                          <p className="text-xs">No patient selected</p>
                        </div>
                      )}
                    </div>

                    {/* Test Summary */}
                    {selectedTest && (
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs text-gray-500 uppercase">Test</h4>
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="font-medium text-sm">{selectedTest.name}</p>
                          {selectedSubtests.length > 0 && (
                            <>
                              <p className="text-xs text-gray-500 mt-1">Subtests ({selectedSubtests.length}):</p>
                              <ul className="text-xs space-y-0.5 mt-0.5 max-h-20 overflow-y-auto">
                                {selectedSubtests.slice(0, 3).map((id) => {
                                  const subtest = selectedTest.subTests.find((s) => s.id === id);
                                  return subtest ? (
                                    <li key={id} className="text-gray-600">• {subtest.name}</li>
                                  ) : null;
                                })}
                                {selectedSubtests.length > 3 && (
                                  <li className="text-gray-400">• and {selectedSubtests.length - 3} more...</li>
                                )}
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sample Summary */}
                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs text-gray-500 uppercase">Sample</h4>
                      <div className="bg-gray-50 rounded-md p-2 space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium">{formData.sampleType}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Collection:</span>
                          <span>
                            {formData.collectionDate ? format(formData.collectionDate, "MMM dd") : "-"} at {formData.collectionTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !selectedPatient || !selectedTest}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm"
                    >
                      {submitting ? (
                        <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Creating...</>
                      ) : (
                        <><CheckCircle className="h-3.5 w-3.5 mr-1.5" />Create Order</>
                      )}
                    </Button>

                    <div className="bg-amber-50 border border-amber-200 rounded-md p-1.5">
                      <p className="text-xs text-amber-800 text-center">
                        ⚠️ Confirm all information is accurate
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}