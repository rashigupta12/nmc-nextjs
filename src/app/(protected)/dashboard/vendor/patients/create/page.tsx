/*eslint-disable @typescript-eslint/no-explicit-any*/
// src/app/(protected)/dashboard/admin/vendor/patients/create/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { useCurrentUser } from "@/hooks/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
type Gender = "M" | "F" | "Other";
type Lifestyle =
  | "No Activity"
  | "Light Activity"
  | "Moderate Activity"
  | "Very Active"
  | "Extremely Active";
type Smoking = "Yes" | "No" | "Occasional";
type YesNo = "yes" | "no";

// ─── Field — defined at module level so React never remounts it on re-render ──
function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function AddPatientPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [loading, setLoading] = useState(false);

  // ── Doctor Info ─────────────────────────────────────────────────────────────
  const [doctorFName, setDoctorFName] = useState("");
  const [doctorLName, setDoctorLName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [clinic, setClinic] = useState("");
  const [docMobileNo, setDocMobileNo] = useState("");
  const [docEmail, setDocEmail] = useState("");

  // ── Patient Personal Info ───────────────────────────────────────────────────
  const [patientFName, setPatientFName] = useState("");
  const [patientMName, setPatientMName] = useState("");
  const [patientLName, setPatientLName] = useState("");
  const [gender, setGender] = useState<Gender>("M");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // ── Address ─────────────────────────────────────────────────────────────────
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");

  // ── Contact ─────────────────────────────────────────────────────────────────
  const [phoneNo, setPhoneNo] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");

  // ── Demographic ─────────────────────────────────────────────────────────────
  const [nationality, setNationality] = useState("");
  const [ethinicity, setEthinicity] = useState("");
  const [lifestyle, setLifestyle] = useState<Lifestyle>("Moderate Activity");

  // ── Medical ─────────────────────────────────────────────────────────────────
  const [patientHistory, setPatientHistory] = useState("");
  const [medication, setMedication] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");
  const [isPatientConsent, setIsPatientConsent] = useState(false);
  const [mrno, setMrno] = useState("");
  const [TRF, setTRF] = useState("");
  const [tag, setTag] = useState("");

  // ── Lifestyle & Health ──────────────────────────────────────────────────────
  const [smoking, setSmoking] = useState<Smoking>("No");
  const [alcoholic, setAlcoholic] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState("");

  // ── Cardiovascular ──────────────────────────────────────────────────────────
  const [chestPain, setChestPain] = useState<YesNo>("no");
  const [cardiacEnzyme, setCardiacEnzyme] = useState<YesNo>("no");

  // ── Lipid Profile ───────────────────────────────────────────────────────────
  const [cholestrol, setCholestrol] = useState("");
  const [hdl, setHdl] = useState("");
  const [ldl, setLdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");

  // ── Vitals ──────────────────────────────────────────────────────────────────
  const [hbValue, setHbValue] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");

  // ── Auto-calculate age from DOB ─────────────────────────────────────────────
  const handleDobChange = (value: string) => {
    setDob(value);
    if (value) {
      const birth = new Date(value);
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
      setAge(String(Math.max(0, years)));
    }
  };

  // ── Generate patient ID ─────────────────────────────────────────────────────
  const generatePatientId = () => {
    const prefix = "PAT";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      patientId: generatePatientId(),
      vendorId: "ece454b1-7035-421d-9b35-1f5253d2ead9",
      createdBy: user?.id ?? "",
      // Doctor
      doctorFName,
      doctorLName: doctorLName || null,
      hospitalName,
      clinic,
      docMobileNo: docMobileNo || null,
      docEmail: docEmail || null,
      // Patient
      patientFName:
        patientFName.charAt(0).toUpperCase() + patientFName.slice(1),
      patientMName: patientMName
        ? patientMName.charAt(0).toUpperCase() + patientMName.slice(1)
        : null,
      patientLName:
        patientLName.charAt(0).toUpperCase() + patientLName.slice(1),
      gender,
      dob,
      age,
      height,
      weight,
      // Address
      address: { street, city, state, country, zipCode },
      // Contact
      phoneNo: phoneNo || null,
      mobileNo: mobileNo || null,
      email,
      // Demographic
      nationality: nationality || null,
      ethinicity,
      lifestyle,
      // Medical
      patientHistory: patientHistory || null,
      medication: medication || null,
      familyHistory: familyHistory || null,
      isPatientConsent: isPatientConsent ? 1 : 0,
      mrno: mrno || null,
      TRF: TRF || null,
      tag: tag || null,
      // Lifestyle
      smoking,
      alcoholic: alcoholic ? 1 : 0,
      medicalHistory: medicalHistory || null,
      // Cardiovascular
      chestPain,
      cardiacEnzyme,
      // Lipid
      cholestrol: cholestrol || null,
      hdl: hdl || null,
      ldl: ldl || null,
      triglycerides: triglycerides || null,
      // Vitals
      hbValue: hbValue || null,
      bp_systolic: bpSystolic || null,
      bp_diastolic: bpDiastolic || null,
    };

    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Patient Created!",
          text: "Patient record has been created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push("/dashboard/admin/patients");
      } else {
        const err = await res.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.error || "Failed to create patient",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 w-full">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/vendor/patients"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Add New Patient
              </h1>
              <p className="text-gray-600">
                Fill in the patient details to create a new record.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Doctor Information ─────────────────────────────────────────── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Doctor First Name" required>
                  <Input
                    value={doctorFName}
                    onChange={(e) => setDoctorFName(e.target.value)}
                    placeholder="John"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Doctor Last Name">
                  <Input
                    value={doctorLName}
                    onChange={(e) => setDoctorLName(e.target.value)}
                    placeholder="Smith"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Hospital Name" required>
                  <Input
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="City General Hospital"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Clinic" required>
                  <Input
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    placeholder="Cardiology Clinic"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Doctor Mobile">
                  <Input
                    value={docMobileNo}
                    onChange={(e) => setDocMobileNo(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Doctor Email">
                  <Input
                    type="email"
                    value={docEmail}
                    onChange={(e) => setDocEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* ── Patient Personal Information ───────────────────────────────── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Patient Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="First Name" required>
                  <Input
                    value={patientFName}
                    onChange={(e) => setPatientFName(e.target.value)}
                    placeholder="Jane"
                    required
                    className="border-gray-300 focus:border-blue-500 capitalize"
                  />
                </Field>
                <Field label="Middle Name">
                  <Input
                    value={patientMName}
                    onChange={(e) => setPatientMName(e.target.value)}
                    placeholder="(optional)"
                    className="border-gray-300 focus:border-blue-500 capitalize"
                  />
                </Field>
                <Field label="Last Name" required>
                  <Input
                    value={patientLName}
                    onChange={(e) => setPatientLName(e.target.value)}
                    placeholder="Doe"
                    required
                    className="border-gray-300 focus:border-blue-500 capitalize"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Field label="Gender" required>
                  <Select
                    value={gender}
                    onValueChange={(v) => setGender(v as Gender)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Date of Birth" required>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Age" required hint="Auto-filled from DOB">
                  <Input
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="30"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Height (cm)" required>
                    <Input
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                      required
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </Field>
                  <Field label="Weight (kg)" required>
                    <Input
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="65"
                      required
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Address ────────────────────────────────────────────────────── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">Address</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Field label="Street" required>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Main Street"
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Field label="City" required>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="State" required>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Country" required>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Zip Code" required>
                  <Input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="400001"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* ── Contact Information ────────────────────────────────────────── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Email" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@email.com"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Mobile No.">
                  <Input
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Phone No.">
                  <Input
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    placeholder="022-12345678"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* ── Demographic ────────────────────────────────────────────────── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Demographic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Nationality">
                  <Input
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="Indian"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Ethnicity" required>
                  <Input
                    value={ethinicity}
                    onChange={(e) => setEthinicity(e.target.value)}
                    placeholder="South Asian"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Lifestyle" required>
                  <Select
                    value={lifestyle}
                    onValueChange={(v) => setLifestyle(v as Lifestyle)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "No Activity",
                        "Light Activity",
                        "Moderate Activity",
                        "Very Active",
                        "Extremely Active",
                      ].map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* ── Medical Information ────────────────────────────────────────── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="MR No.">
                  <Input
                    value={mrno}
                    onChange={(e) => setMrno(e.target.value)}
                    placeholder="MR-12345"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="TRF">
                  <Input
                    value={TRF}
                    onChange={(e) => setTRF(e.target.value)}
                    placeholder="TRF reference"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Tag">
                  <Input
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="VIP / Priority"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
              </div>

              <Field label="Patient History">
                <Textarea
                  rows={3}
                  value={patientHistory}
                  onChange={(e) => setPatientHistory(e.target.value)}
                  placeholder="Relevant medical history..."
                  className="border-gray-300 focus:border-blue-500"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Current Medication">
                  <Textarea
                    rows={2}
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    placeholder="List current medications..."
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
                <Field label="Family History">
                  <Textarea
                    rows={2}
                    value={familyHistory}
                    onChange={(e) => setFamilyHistory(e.target.value)}
                    placeholder="Known hereditary conditions..."
                    className="border-gray-300 focus:border-blue-500"
                  />
                </Field>
              </div>

              {/* Patient Consent */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <Label className="text-gray-700">Patient Consent</Label>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Patient has given informed consent for testing
                  </p>
                </div>
                <Switch
                  checked={isPatientConsent}
                  onCheckedChange={setIsPatientConsent}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Lifestyle & Health ─────────────────────────────────────────── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Lifestyle & Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Smoking" required>
                  <Select
                    value={smoking}
                    onValueChange={(v) => setSmoking(v as Smoking)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="Occasional">Occasional</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 h-fit self-end">
                  <Label className="text-gray-700">Alcoholic</Label>
                  <Switch checked={alcoholic} onCheckedChange={setAlcoholic} />
                </div>
              </div>

              <Field label="Medical History">
                <Textarea
                  rows={3}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Detailed medical history..."
                  className="border-gray-300 focus:border-blue-500"
                />
              </Field>
            </CardContent>
          </Card>

          {/* ── Cardiovascular ─────────────────────────────────────────────── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Cardiovascular Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Chest Pain" required>
                  <Select
                    value={chestPain}
                    onValueChange={(v) => setChestPain(v as YesNo)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Cardiac Enzyme" required>
                  <Select
                    value={cardiacEnzyme}
                    onValueChange={(v) => setCardiacEnzyme(v as YesNo)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Lipid Profile */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Lipid Profile
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Field label="Cholesterol">
                    <Input
                      value={cholestrol}
                      onChange={(e) => setCholestrol(e.target.value)}
                      placeholder="mg/dL"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </Field>
                  <Field label="HDL">
                    <Input
                      value={hdl}
                      onChange={(e) => setHdl(e.target.value)}
                      placeholder="mg/dL"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </Field>
                  <Field label="LDL">
                    <Input
                      value={ldl}
                      onChange={(e) => setLdl(e.target.value)}
                      placeholder="mg/dL"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </Field>
                  <Field label="Triglycerides">
                    <Input
                      value={triglycerides}
                      onChange={(e) => setTriglycerides(e.target.value)}
                      placeholder="mg/dL"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </Field>
                </div>
              </div>

              {/* Vitals */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Vital Signs
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Hemoglobin (Hb)">
                    <Input
                      value={hbValue}
                      onChange={(e) => setHbValue(e.target.value)}
                      placeholder="g/dL"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </Field>
                  <Field label="BP Systolic">
                    <Input
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(e.target.value)}
                      placeholder="mmHg"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </Field>
                  <Field label="BP Diastolic">
                    <Input
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(e.target.value)}
                      placeholder="mmHg"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Submit ─────────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {loading ? "Creating…" : "Create Patient"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Link href="/dashboard/vendor/patients">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
