// src/app/(protected)/vendor/dashboard/patients/create/page.tsx
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
import { FormField } from "@/components/form/FormField";
import { SearchableSelect } from "@/components/form/SearchableSelect";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { useCurrentUser } from "@/hooks/auth";
import { Country, State, City } from "country-state-city";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
type Gender = "M" | "F" | "Other";
type Lifestyle = "No Activity" | "Light Activity" | "Moderate Activity" | "Very Active" | "Extremely Active";
type Smoking = "Yes" | "No" | "Occasional";
type YesNo = "yes" | "no";

interface Hospital {
  id: string;
  hospital: string;
  address: string;
  contactNo: string;
}

interface Ethnicity {
  id: string;
  ethnicity: string;
}

export default function AddPatientPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingEthnicities, setLoadingEthnicities] = useState(false);
  
  // Hospital and Ethnicity state
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [ethnicities, setEthnicities] = useState<Ethnicity[]>([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedEthnicity, setSelectedEthnicity] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [ethnicitySearch, setEthnicitySearch] = useState("");
  
  // Dialog states for adding new
  const [showAddHospitalDialog, setShowAddHospitalDialog] = useState(false);
  const [showAddEthnicityDialog, setShowAddEthnicityDialog] = useState(false);
  const [newHospital, setNewHospital] = useState({ name: "", address: "", contactNo: "" });
  const [newEthnicity, setNewEthnicity] = useState("");
  const [addingHospital, setAddingHospital] = useState(false);
  const [addingEthnicity, setAddingEthnicity] = useState(false);
  
  // Country-State-City
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [states, setStates] = useState<{ code: string; name: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Doctor Info
  const [doctorFName, setDoctorFName] = useState("");
  const [doctorLName, setDoctorLName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [clinic, setClinic] = useState("");
  const [docMobileNo, setDocMobileNo] = useState("");
  const [docEmail, setDocEmail] = useState("");

  // Patient Personal Info
  const [patientFName, setPatientFName] = useState("");
  const [patientMName, setPatientMName] = useState("");
  const [patientLName, setPatientLName] = useState("");
  const [gender, setGender] = useState<Gender>("M");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Contact
  const [phoneNo, setPhoneNo] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");

  // Demographic
  const [nationality, setNationality] = useState("");
  const [lifestyle, setLifestyle] = useState<Lifestyle>("Moderate Activity");

  // Medical
  const [patientHistory, setPatientHistory] = useState("");
  const [medication, setMedication] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");
  const [isPatientConsent, setIsPatientConsent] = useState(false);
  const [mrno, setMrno] = useState("");
  const [TRF, setTRF] = useState("");
  const [tag, setTag] = useState("");

  // Lifestyle & Health
  const [smoking, setSmoking] = useState<Smoking>("No");
  const [alcoholic, setAlcoholic] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState("");

  // Cardiovascular
  const [chestPain, setChestPain] = useState<YesNo>("no");
  const [cardiacEnzyme, setCardiacEnzyme] = useState<YesNo>("no");

  // Lipid Profile
  const [cholestrol, setCholestrol] = useState("");
  const [hdl, setHdl] = useState("");
  const [ldl, setLdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");

  // Vitals
  const [hbValue, setHbValue] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");

  // Fetch hospitals
  const fetchHospitals = useCallback(async () => {
    setLoadingHospitals(true);
    try {
      const params = new URLSearchParams();
      if (hospitalSearch) params.set("search", hospitalSearch);
      params.set("limit", "50");
      
      const res = await fetch(`/api/internalwork/vendor-hospitals?${params}`);
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
    } finally {
      setLoadingHospitals(false);
    }
  }, [hospitalSearch]);

  // Fetch ethnicities
  const fetchEthnicities = useCallback(async () => {
    setLoadingEthnicities(true);
    try {
      const params = new URLSearchParams();
      if (ethnicitySearch) params.set("search", ethnicitySearch);
      params.set("limit", "50");
      
      const res = await fetch(`/api/internalwork/vendor-ethnicities?${params}`);
      const data = await res.json();
      if (data.success) {
        setEthnicities(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch ethnicities:", error);
    } finally {
      setLoadingEthnicities(false);
    }
  }, [ethnicitySearch]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  useEffect(() => {
    fetchEthnicities();
  }, [fetchEthnicities]);

  // Initialize countries
  useEffect(() => {
    const allCountries = Country.getAllCountries().map(c => ({
      code: c.isoCode,
      name: c.name,
    }));
    setCountries(allCountries);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const statesList = State.getStatesOfCountry(selectedCountry).map(s => ({
        code: s.isoCode,
        name: s.name,
      }));
      setStates(statesList);
      setSelectedState("");
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const citiesList = City.getCitiesOfState(selectedCountry, selectedState).map(c => c.name);
      setCities(citiesList);
      setSelectedCity("");
    }
  }, [selectedCountry, selectedState]);

  // Auto-calculate age from DOB
  const handleDobChange = (value: string) => {
    setDob(value);
    if (value) {
      const birth = new Date(value);
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
      setAge(String(Math.max(0, years)));
    } else {
      setAge("");
    }
  };

  // Validate that either DOB or Age is provided
  const validateDobAge = () => {
    if (!dob && !age) {
      Swal.fire("Error", "Either Date of Birth or Age is required", "error");
      return false;
    }
    return true;
  };

  // Add new hospital
  const handleAddHospital = async () => {
    if (!newHospital.name) {
      Swal.fire("Error", "Hospital name is required", "error");
      return;
    }
    
    setAddingHospital(true);
    try {
      const res = await fetch("/api/internalwork/vendor-hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital: newHospital.name,
          address: newHospital.address,
          contactNo: newHospital.contactNo,
          isActive: true,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setHospitals(prev => [...prev, data.data]);
        setSelectedHospital(data.data.id);
        setHospitalName(data.data.hospital);
        setShowAddHospitalDialog(false);
        setNewHospital({ name: "", address: "", contactNo: "" });
        Swal.fire("Success", "Hospital added successfully", "success");
      } else {
        Swal.fire("Error", data.error || "Failed to add hospital", "error");
      }
    } catch (error) {
      console.error("Error adding hospital:", error);
      Swal.fire("Error", "Failed to add hospital", "error");
    } finally {
      setAddingHospital(false);
    }
  };

  // Add new ethnicity
  const handleAddEthnicity = async () => {
    if (!newEthnicity) {
      Swal.fire("Error", "Ethnicity name is required", "error");
      return;
    }
    
    setAddingEthnicity(true);
    try {
      const res = await fetch("/api/internalwork/vendor-ethnicities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ethnicity: newEthnicity }),
      });
      
      const data = await res.json();
      if (data.success) {
        setEthnicities(prev => [...prev, data.data]);
        setSelectedEthnicity(data.data.id);
        setShowAddEthnicityDialog(false);
        setNewEthnicity("");
        Swal.fire("Success", "Ethnicity added successfully", "success");
      } else {
        Swal.fire("Error", data.error || "Failed to add ethnicity", "error");
      }
    } catch (error) {
      console.error("Error adding ethnicity:", error);
      Swal.fire("Error", "Failed to add ethnicity", "error");
    } finally {
      setAddingEthnicity(false);
    }
  };

  // Generate patient ID
  const generatePatientId = () => {
    const prefix = "PAT";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  // Build address object
  const buildAddress = () => {
    const addressParts = [];
    if (street) addressParts.push(street);
    if (selectedCity) addressParts.push(selectedCity);
    if (selectedState) addressParts.push(states.find(s => s.code === selectedState)?.name);
    if (selectedCountry) addressParts.push(countries.find(c => c.code === selectedCountry)?.name);
    if (zipCode) addressParts.push(zipCode);
    
    return {
      street: street || "",
      city: selectedCity || "",
      state: selectedState || "",
      country: selectedCountry || "",
      zipCode: zipCode || "",
      fullAddress: addressParts.filter(Boolean).join(", "),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDobAge()) return;
    if (!selectedHospital) {
      Swal.fire("Error", "Please select a hospital", "error");
      return;
    }
    if (!selectedEthnicity) {
      Swal.fire("Error", "Please select an ethnicity", "error");
      return;
    }
    
    setLoading(true);

    const payload = {
      patientId: generatePatientId(),
      vendorId: "ece454b1-7035-421d-9b35-1f5253d2ead9", // Replace with actual vendor ID from context/session
      createdBy: user?.id ?? "",
      // Doctor
      doctorFName,
      doctorLName: doctorLName || null,
      hospitalName,
      clinic: clinic || null, // Make clinic optional - send null if empty
      docMobileNo: docMobileNo || null,
      docEmail: docEmail || null,
      // Patient
      patientFName: patientFName.charAt(0).toUpperCase() + patientFName.slice(1),
      patientMName: patientMName ? patientMName.charAt(0).toUpperCase() + patientMName.slice(1) : null,
      patientLName: patientLName.charAt(0).toUpperCase() + patientLName.slice(1),
      gender,
      dob: dob || null,
      age: age || null,
      height,
      weight,
      // Address
      address: buildAddress(),
      // Contact
      phoneNo: phoneNo || null,
      mobileNo: mobileNo || null,
      email,
      // Demographic
      nationality: nationality || null,
      ethinicity: selectedEthnicity,
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
        router.push("/vendor/dashboard/patients");
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

  // Grouped sections for better organization
  const sections = [
    {
      title: "Doctor Information",
      gradient: "from-blue-50 to-blue-50",
      fields: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Doctor First Name" required>
            <Input 
              value={doctorFName} 
              onChange={(e) => setDoctorFName(e.target.value)} 
              placeholder="John" 
              required 
            />
          </FormField>
          <FormField label="Doctor Last Name">
            <Input 
              value={doctorLName} 
              onChange={(e) => setDoctorLName(e.target.value)} 
              placeholder="Smith" 
            />
          </FormField>
          <FormField label="Hospital" required>
            <SearchableSelect
              value={selectedHospital}
              onChange={(id, name) => {
                setSelectedHospital(id);
                setHospitalName(name);
              }}
              options={hospitals.map(h => ({ id: h.id, name: h.hospital }))}
              placeholder="Select or search hospital..."
              searchPlaceholder="Search hospital..."
              loading={loadingHospitals}
              onAddNew={() => setShowAddHospitalDialog(true)}
            />
          </FormField>
          <FormField label="Clinic" hint="Optional">
            <Input 
              value={clinic} 
              onChange={(e) => setClinic(e.target.value)} 
              placeholder="Cardiology Clinic (optional)" 
            />
          </FormField>
          <FormField label="Doctor Mobile">
            <Input 
              value={docMobileNo} 
              onChange={(e) => setDocMobileNo(e.target.value)} 
              placeholder="+91 98765 43210" 
            />
          </FormField>
          <FormField label="Doctor Email">
            <Input 
              type="email" 
              value={docEmail} 
              onChange={(e) => setDocEmail(e.target.value)} 
              placeholder="doctor@hospital.com" 
            />
          </FormField>
        </div>
      ),
    },
    {
      title: "Patient Personal Information",
      gradient: "from-blue-50 to-blue-50",
      fields: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="First Name" required>
              <Input 
                value={patientFName} 
                onChange={(e) => setPatientFName(e.target.value)} 
                placeholder="Jane" 
                required 
                className="capitalize" 
              />
            </FormField>
            <FormField label="Middle Name">
              <Input 
                value={patientMName} 
                onChange={(e) => setPatientMName(e.target.value)} 
                placeholder="(optional)" 
                className="capitalize" 
              />
            </FormField>
            <FormField label="Last Name" required>
              <Input 
                value={patientLName} 
                onChange={(e) => setPatientLName(e.target.value)} 
                placeholder="Doe" 
                required 
                className="capitalize" 
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormField label="Gender" required>
              <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Date of Birth" hint="Either DOB or Age is required">
              <Input 
                type="date" 
                value={dob} 
                onChange={(e) => handleDobChange(e.target.value)} 
              />
            </FormField>
            <FormField label="Age" hint="Either DOB or Age is required">
              <Input 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                placeholder="30" 
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Height (cm)" required>
                <Input 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)} 
                  placeholder="170" 
                  required 
                />
              </FormField>
              <FormField label="Weight (kg)" required>
                <Input 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="65" 
                  required 
                />
              </FormField>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Address",
      gradient: "from-blue-50 to-blue-50",
      fields: (
        <div className="space-y-4">
          <FormField label="Street Address">
            <Input 
              value={street} 
              onChange={(e) => setStreet(e.target.value)} 
              placeholder="123 Main Street" 
            />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Country">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="State">
              <Select value={selectedState} onValueChange={setSelectedState} disabled={!selectedCountry}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {states.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="City">
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Zip Code">
              <Input 
                value={zipCode} 
                onChange={(e) => setZipCode(e.target.value)} 
                placeholder="400001" 
              />
            </FormField>
          </div>
        </div>
      ),
    },
    {
      title: "Contact Information",
      gradient: "from-blue-50 to-blue-50",
      fields: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Email" required>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="patient@email.com" 
              required 
            />
          </FormField>
          <FormField label="Mobile No.">
            <Input 
              value={mobileNo} 
              onChange={(e) => setMobileNo(e.target.value)} 
              placeholder="+91 98765 43210" 
            />
          </FormField>
          <FormField label="Phone No.">
            <Input 
              value={phoneNo} 
              onChange={(e) => setPhoneNo(e.target.value)} 
              placeholder="022-12345678" 
            />
          </FormField>
        </div>
      ),
    },
    {
      title: "Demographic Information",
      gradient: "from-blue-50 to-blue-50",
      fields: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Nationality">
            <Input 
              value={nationality} 
              onChange={(e) => setNationality(e.target.value)} 
              placeholder="Indian" 
            />
          </FormField>
          <FormField label="Ethnicity" required>
            <SearchableSelect
              value={selectedEthnicity}
              onChange={(id, name) => setSelectedEthnicity(id)}
              options={ethnicities.map(e => ({ id: e.id, name: e.ethnicity }))}
              placeholder="Select or search ethnicity..."
              searchPlaceholder="Search ethnicity..."
              loading={loadingEthnicities}
              onAddNew={() => setShowAddEthnicityDialog(true)}
            />
          </FormField>
          <FormField label="Lifestyle" required>
            <Select value={lifestyle} onValueChange={(v) => setLifestyle(v as Lifestyle)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["No Activity", "Light Activity", "Moderate Activity", "Very Active", "Extremely Active"].map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      ),
    },
    {
      title: "Medical Information",
      gradient: "from-amber-50 to-amber-50",
      fields: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="MR No.">
              <Input 
                value={mrno} 
                onChange={(e) => setMrno(e.target.value)} 
                placeholder="MR-12345" 
              />
            </FormField>
            <FormField label="TRF">
              <Input 
                value={TRF} 
                onChange={(e) => setTRF(e.target.value)} 
                placeholder="TRF reference" 
              />
            </FormField>
            <FormField label="Tag">
              <Input 
                value={tag} 
                onChange={(e) => setTag(e.target.value)} 
                placeholder="VIP / Priority" 
              />
            </FormField>
          </div>
          <FormField label="Patient History">
            <Textarea 
              rows={3} 
              value={patientHistory} 
              onChange={(e) => setPatientHistory(e.target.value)} 
              placeholder="Relevant medical history..." 
            />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Current Medication">
              <Textarea 
                rows={2} 
                value={medication} 
                onChange={(e) => setMedication(e.target.value)} 
                placeholder="List current medications..." 
              />
            </FormField>
            <FormField label="Family History">
              <Textarea 
                rows={2} 
                value={familyHistory} 
                onChange={(e) => setFamilyHistory(e.target.value)} 
                placeholder="Known hereditary conditions..." 
              />
            </FormField>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <Label>Patient Consent</Label>
              <p className="text-sm text-gray-500">Patient has given informed consent for testing</p>
            </div>
            <Switch checked={isPatientConsent} onCheckedChange={setIsPatientConsent} />
          </div>
        </>
      ),
    },
    {
      title: "Lifestyle & Health",
      gradient: "from-amber-50 to-amber-50",
      fields: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Smoking" required>
              <Select value={smoking} onValueChange={(v) => setSmoking(v as Smoking)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="Occasional">Occasional</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border h-fit self-end">
              <Label>Alcoholic</Label>
              <Switch checked={alcoholic} onCheckedChange={setAlcoholic} />
            </div>
          </div>
          <FormField label="Medical History">
            <Textarea 
              rows={3} 
              value={medicalHistory} 
              onChange={(e) => setMedicalHistory(e.target.value)} 
              placeholder="Detailed medical history..." 
            />
          </FormField>
        </>
      ),
    },
    {
      title: "Cardiovascular Health",
      gradient: "from-blue-50 to-blue-50",
      fields: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Chest Pain" required>
              <Select value={chestPain} onValueChange={(v) => setChestPain(v as YesNo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Cardiac Enzyme" required>
              <Select value={cardiacEnzyme} onValueChange={(v) => setCardiacEnzyme(v as YesNo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Lipid Profile</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Cholesterol">
                <Input 
                  value={cholestrol} 
                  onChange={(e) => setCholestrol(e.target.value)} 
                  placeholder="mg/dL" 
                />
              </FormField>
              <FormField label="HDL">
                <Input 
                  value={hdl} 
                  onChange={(e) => setHdl(e.target.value)} 
                  placeholder="mg/dL" 
                />
              </FormField>
              <FormField label="LDL">
                <Input 
                  value={ldl} 
                  onChange={(e) => setLdl(e.target.value)} 
                  placeholder="mg/dL" 
                />
              </FormField>
              <FormField label="Triglycerides">
                <Input 
                  value={triglycerides} 
                  onChange={(e) => setTriglycerides(e.target.value)} 
                  placeholder="mg/dL" 
                />
              </FormField>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Vital Signs</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Hemoglobin (Hb)">
                <Input 
                  value={hbValue} 
                  onChange={(e) => setHbValue(e.target.value)} 
                  placeholder="g/dL" 
                />
              </FormField>
              <FormField label="BP Systolic">
                <Input 
                  value={bpSystolic} 
                  onChange={(e) => setBpSystolic(e.target.value)} 
                  placeholder="mmHg" 
                />
              </FormField>
              <FormField label="BP Diastolic">
                <Input 
                  value={bpDiastolic} 
                  onChange={(e) => setBpDiastolic(e.target.value)} 
                  placeholder="mmHg" 
                />
              </FormField>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white  w-full">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/vendor/dashboard/patients" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Patient</h1>
            <p className="text-gray-600">Fill in the patient details to create a new record.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {sections.map((section, idx) => (
            <Card key={idx} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className={`bg-gradient-to-r ${section.gradient} border-b`}>
                <CardTitle className="text-xl text-gray-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {section.fields}
              </CardContent>
            </Card>
          ))}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create Patient"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              asChild 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Link href="/vendor/dashboard/patients">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>

      {/* Add Hospital Dialog */}
      <Dialog open={showAddHospitalDialog} onOpenChange={setShowAddHospitalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Hospital</DialogTitle>
            <DialogDescription>Enter the hospital details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label="Hospital Name" required>
              <Input 
                value={newHospital.name} 
                onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })} 
                placeholder="City General Hospital" 
              />
            </FormField>
            <FormField label="Address">
              <Textarea 
                value={newHospital.address} 
                onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })} 
                placeholder="Full address..." 
                rows={2} 
              />
            </FormField>
            <FormField label="Contact Number">
              <Input 
                value={newHospital.contactNo} 
                onChange={(e) => setNewHospital({ ...newHospital, contactNo: e.target.value })} 
                placeholder="+91 1234567890" 
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddHospitalDialog(false)}>Cancel</Button>
            <Button onClick={handleAddHospital} disabled={addingHospital} className="bg-blue-600">
              {addingHospital && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Hospital
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Ethnicity Dialog */}
      <Dialog open={showAddEthnicityDialog} onOpenChange={setShowAddEthnicityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Ethnicity</DialogTitle>
            <DialogDescription>Enter the ethnicity name below.</DialogDescription>
          </DialogHeader>
          <FormField label="Ethnicity Name" required>
            <Input 
              value={newEthnicity} 
              onChange={(e) => setNewEthnicity(e.target.value)} 
              placeholder="e.g., South Asian, Caucasian, etc." 
            />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEthnicityDialog(false)}>Cancel</Button>
            <Button onClick={handleAddEthnicity} disabled={addingEthnicity} className="bg-blue-600">
              {addingEthnicity && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Ethnicity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}