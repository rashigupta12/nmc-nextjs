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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Building2,
  User,
  MapPin,
  Phone,
  Stethoscope,
  Heart,
  Activity,
  X,
  Loader2,
  CalendarDays,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { useCurrentUser } from "@/hooks/auth";
import {
  Country,
  State,
  City,
  type ICountry,
  type IState,
  type ICity,
} from "country-state-city";

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
type AgeInputMode = "dob" | "age";

interface HospitalOption {
  id: string;
  hospital: string;
  address: string;
  contactNo: string;
}

interface EthnicityOption {
  id: string;
  ethnicity: string;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  accent = "blue",
  children,
}: {
  title: string;
  icon: React.ElementType;
  accent?: "blue" | "amber" | "emerald" | "rose";
  children: React.ReactNode;
}) {
  const accents = {
    blue: "from-blue-600 to-indigo-600",
    amber: "from-amber-500 to-orange-500",
    emerald: "from-emerald-500 to-teal-600",
    rose: "from-rose-500 to-pink-600",
  };
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className={`bg-gradient-to-r ${accents[accent]} px-6 py-4 flex items-center gap-3`}>
        <div className="p-1.5 bg-white/20 rounded-lg">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-base font-semibold text-white tracking-wide">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
  hint,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}{" "}
        {required && <span className="text-rose-500 normal-case text-sm">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-400 italic">{hint}</p>}
    </div>
  );
}

// ─── Styled input ─────────────────────────────────────────────────────────────
const SI = "h-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm text-gray-800 placeholder:text-gray-300";

// ─── Hospital Search Combobox ─────────────────────────────────────────────────
function HospitalSearch({
  vendorId,
  value,
  onChange,
}: {
  vendorId: string;
  value: string;
  onChange: (hospital: HospitalOption | null) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<HospitalOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/vendor-hospitals?vendorId=${vendorId}&search=${encodeURIComponent(q)}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.hospitals ?? []);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    },
    [vendorId]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
    if (!q) onChange(null);
  };

  const select = (h: HospitalOption) => {
    setQuery(h.hospital);
    setOpen(false);
    onChange(h);
  };

  const clear = () => {
    setQuery("");
    onChange(null);
    setResults([]);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => query && setOpen(true)}
          placeholder="Search hospital name…"
          className={`${SI} w-full pl-9 pr-8`}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (results.length > 0 || loading) && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
            </div>
          ) : (
            results.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => select(h)}
                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <p className="text-sm font-medium text-gray-800">{h.hospital}</p>
                <p className="text-xs text-gray-400 truncate">{h.address}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Ethnicity Search Combobox ────────────────────────────────────────────────
function EthnicitySearch({
  vendorId,
  value,
  onChange,
}: {
  vendorId: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<EthnicityOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/vendor-ethnicities?vendorId=${vendorId}&search=${encodeURIComponent(q)}&limit=10`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.ethnicities ?? []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [vendorId]);

  // Load all on mount
  useEffect(() => { search(""); }, [search]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
    onChange(q);
  };

  const select = (e: EthnicityOption) => {
    setQuery(e.ethnicity);
    setOpen(false);
    onChange(e.ethnicity);
  };

  const clear = () => { setQuery(""); onChange(""); };

  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder="Search ethnicity…"
          required
          className={`${SI} w-full pl-9 pr-8`}
        />
        {query && (
          <button type="button" onClick={clear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (results.length > 0 || loading) && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </div>
          ) : (
            results.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => select(e)}
                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 text-sm text-gray-800"
              >
                {e.ethnicity}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Country / State / City Selects ──────────────────────────────────────────
function LocationSelects({
  country, state, city,
  onCountry, onState, onCity,
}: {
  country: string; state: string; city: string;
  onCountry: (v: string) => void;
  onState: (v: string) => void;
  onCity: (v: string) => void;
}) {
  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(country) : [];
  const cities = country && state ? City.getCitiesOfState(country, state) : [];

  return (
    <>
      <Field label="Country" required>
        <select
          value={country}
          onChange={(e) => { onCountry(e.target.value); onState(""); onCity(""); }}
          required
          className={`${SI} w-full px-3`}
        >
          <option value="">Select country…</option>
          {countries.map((c: ICountry) => (
            <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
          ))}
        </select>
      </Field>

      <Field label="State" required>
        <select
          value={state}
          onChange={(e) => { onState(e.target.value); onCity(""); }}
          required
          disabled={!country}
          className={`${SI} w-full px-3 disabled:opacity-50`}
        >
          <option value="">Select state…</option>
          {states.map((s: IState) => (
            <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
          ))}
        </select>
      </Field>

      <Field label="City" required>
        <select
          value={city}
          onChange={(e) => onCity(e.target.value)}
          required
          disabled={!state}
          className={`${SI} w-full px-3 disabled:opacity-50`}
        >
          <option value="">Select city…</option>
          {cities.map((c: ICity) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </Field>
    </>
  );
}

// ─── Age/DOB Toggle ───────────────────────────────────────────────────────────
function AgeDobInput({
  mode, dob, age, onMode, onDob, onAge,
}: {
  mode: AgeInputMode;
  dob: string; age: string;
  onMode: (m: AgeInputMode) => void;
  onDob: (v: string) => void;
  onAge: (v: string) => void;
}) {
  const handleDob = (v: string) => {
    onDob(v);
    if (v) {
      const birth = new Date(v);
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
      onAge(String(Math.max(0, years)));
    } else {
      onAge("");
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {mode === "dob" ? "Date of Birth" : "Age"}{" "}
          <span className="text-rose-500">*</span>
        </Label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => onMode("dob")}
            className={`px-3 py-1 transition-colors flex items-center gap-1 ${
              mode === "dob"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <CalendarDays className="h-3 w-3" />
            DOB
          </button>
          <button
            type="button"
            onClick={() => onMode("age")}
            className={`px-3 py-1 transition-colors flex items-center gap-1 ${
              mode === "age"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Hash className="h-3 w-3" />
            Age
          </button>
        </div>
      </div>

      {mode === "dob" ? (
        <Input
          type="date"
          value={dob}
          onChange={(e) => handleDob(e.target.value)}
          required
          className={SI}
        />
      ) : (
        <Input
          type="number"
          min={0}
          max={150}
          value={age}
          onChange={(e) => onAge(e.target.value)}
          placeholder="Enter age in years"
          required
          className={SI}
        />
      )}

      {mode === "dob" && age && (
        <p className="text-xs text-indigo-500 font-medium">
          Calculated age: <span className="font-bold">{age} years</span>
        </p>
      )}
    </div>
  );
}

// ─── Progress Steps ───────────────────────────────────────────────────────────
const STEPS = ["Doctor", "Patient", "Address", "Medical", "Cardiovascular"];

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < current
                  ? "bg-indigo-600 text-white"
                  : i === current
                  ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400 ring-offset-1"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span className="text-[10px] font-medium text-gray-400 hidden sm:block">{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 transition-all ${i < current ? "bg-indigo-400" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AddPatientPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const VENDOR_ID = "ece454b1-7035-421d-9b35-1f5253d2ead9";

  // ── Age/DOB mode ────────────────────────────────────────────────────────────
  const [ageMode, setAgeMode] = useState<AgeInputMode>("dob");

  // ── Doctor Info ─────────────────────────────────────────────────────────────
  const [doctorFName, setDoctorFName] = useState("");
  const [doctorLName, setDoctorLName] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<HospitalOption | null>(null);
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
  const [country, setCountry] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
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

  // ── Resolve display names ───────────────────────────────────────────────────
  const countryName = country ? Country.getCountryByCode(country)?.name ?? "" : "";
  const stateName = country && stateCode ? State.getStateByCodeAndCountry(stateCode, country)?.name ?? "" : "";

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
      vendorId: VENDOR_ID,
      createdBy: user?.id ?? "",
      doctorFName,
      doctorLName: doctorLName || null,
      hospitalName: selectedHospital?.hospital ?? "",
      clinic,
      docMobileNo: docMobileNo || null,
      docEmail: docEmail || null,
      patientFName: patientFName.charAt(0).toUpperCase() + patientFName.slice(1),
      patientMName: patientMName ? patientMName.charAt(0).toUpperCase() + patientMName.slice(1) : null,
      patientLName: patientLName.charAt(0).toUpperCase() + patientLName.slice(1),
      gender,
      dob: ageMode === "dob" ? dob : null,
      age,
      height,
      weight,
      address: { street, city, state: stateName, country: countryName, zipCode },
      phoneNo: phoneNo || null,
      mobileNo: mobileNo || null,
      email,
      nationality: nationality || null,
      ethinicity,
      lifestyle,
      patientHistory: patientHistory || null,
      medication: medication || null,
      familyHistory: familyHistory || null,
      isPatientConsent: isPatientConsent ? 1 : 0,
      mrno: mrno || null,
      TRF: TRF || null,
      tag: tag || null,
      smoking,
      alcoholic: alcoholic ? 1 : 0,
      medicalHistory: medicalHistory || null,
      chestPain,
      cardiacEnzyme,
      cholestrol: cholestrol || null,
      hdl: hdl || null,
      ldl: ldl || null,
      triglycerides: triglycerides || null,
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
        Swal.fire({ icon: "error", title: "Error", text: err.error || "Failed to create patient" });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  // Determine rough progress step for the visual bar
  const progressStep = (() => {
    if (bpSystolic || chestPain !== "no") return 4;
    if (smoking || medicalHistory) return 3;
    if (street || country) return 2;
    if (patientFName) return 1;
    if (doctorFName) return 0;
    return 0;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <Link
            href="/dashboard/vendor/patients"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-5 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Patients
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Add New Patient
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Complete all required fields to register a new patient record.
              </p>
            </div>
            <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 hidden sm:flex">
              Admin Portal
            </Badge>
          </div>
        </div>

        <ProgressBar current={progressStep} />

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Doctor Information ─────────────────────────────────────────── */}
          <Section title="Doctor Information" icon={Stethoscope} accent="blue">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Doctor First Name" required>
                <Input value={doctorFName} onChange={(e) => setDoctorFName(e.target.value)}
                  placeholder="John" required className={SI} />
              </Field>
              <Field label="Doctor Last Name">
                <Input value={doctorLName} onChange={(e) => setDoctorLName(e.target.value)}
                  placeholder="Smith" className={SI} />
              </Field>
            </div>

            <Field label="Hospital Name" required hint="Search from registered hospitals">
              <HospitalSearch
                vendorId={VENDOR_ID}
                value={selectedHospital?.hospital ?? ""}
                onChange={setSelectedHospital}
              />
              {selectedHospital && (
                <div className="mt-2 flex items-start gap-2 bg-indigo-50 rounded-xl px-3 py-2 text-xs text-indigo-700">
                  <Building2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{selectedHospital.address} · {selectedHospital.contactNo}</span>
                </div>
              )}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Clinic" required>
                <Input value={clinic} onChange={(e) => setClinic(e.target.value)}
                  placeholder="Cardiology Clinic" required className={SI} />
              </Field>
              <Field label="Doctor Mobile">
                <Input value={docMobileNo} onChange={(e) => setDocMobileNo(e.target.value)}
                  placeholder="+91 98765 43210" className={SI} />
              </Field>
              <Field label="Doctor Email">
                <Input type="email" value={docEmail} onChange={(e) => setDocEmail(e.target.value)}
                  placeholder="doctor@hospital.com" className={SI} />
              </Field>
            </div>
          </Section>

          {/* ── Patient Personal Information ───────────────────────────────── */}
          <Section title="Patient Personal Information" icon={User} accent="emerald">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="First Name" required>
                <Input value={patientFName} onChange={(e) => setPatientFName(e.target.value)}
                  placeholder="Jane" required className={`${SI} capitalize`} />
              </Field>
              <Field label="Middle Name">
                <Input value={patientMName} onChange={(e) => setPatientMName(e.target.value)}
                  placeholder="(optional)" className={`${SI} capitalize`} />
              </Field>
              <Field label="Last Name" required>
                <Input value={patientLName} onChange={(e) => setPatientLName(e.target.value)}
                  placeholder="Doe" required className={`${SI} capitalize`} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              <Field label="Gender" required>
                <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                  <SelectTrigger className={SI}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Age OR DOB — spans 2 cols */}
              <div className="sm:col-span-2">
                <AgeDobInput
                  mode={ageMode}
                  dob={dob}
                  age={age}
                  onMode={setAgeMode}
                  onDob={setDob}
                  onAge={setAge}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Height (cm)" required>
                  <Input value={height} onChange={(e) => setHeight(e.target.value)}
                    placeholder="170" required className={SI} />
                </Field>
                <Field label="Weight (kg)" required>
                  <Input value={weight} onChange={(e) => setWeight(e.target.value)}
                    placeholder="65" required className={SI} />
                </Field>
              </div>
            </div>
          </Section>

          {/* ── Address ────────────────────────────────────────────────────── */}
          <Section title="Address" icon={MapPin} accent="amber">
            <Field label="Street Address" required>
              <Input value={street} onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Main Street, Apartment 4B" required className={SI} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <LocationSelects
                country={country}
                state={stateCode}
                city={city}
                onCountry={setCountry}
                onState={setStateCode}
                onCity={setCity}
              />
            </div>

            <Field label="ZIP / Postal Code" required className="sm:w-1/3">
              <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)}
                placeholder="400001" required className={SI} />
            </Field>
          </Section>

          {/* ── Contact & Demographics ─────────────────────────────────────── */}
          <Section title="Contact & Demographics" icon={Phone} accent="blue">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Email" required>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@email.com" required className={SI} />
              </Field>
              <Field label="Mobile No.">
                <Input value={mobileNo} onChange={(e) => setMobileNo(e.target.value)}
                  placeholder="+91 98765 43210" className={SI} />
              </Field>
              <Field label="Phone No.">
                <Input value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)}
                  placeholder="022-12345678" className={SI} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Nationality">
                <Input value={nationality} onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. Indian" className={SI} />
              </Field>
              <Field label="Ethnicity" required hint="Search from registered ethnicities">
                <EthnicitySearch
                  vendorId={VENDOR_ID}
                  value={ethinicity}
                  onChange={setEthinicity}
                />
              </Field>
              <Field label="Lifestyle" required>
                <Select value={lifestyle} onValueChange={(v) => setLifestyle(v as Lifestyle)}>
                  <SelectTrigger className={SI}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["No Activity", "Light Activity", "Moderate Activity", "Very Active", "Extremely Active"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* ── Medical Information ────────────────────────────────────────── */}
          <Section title="Medical Information" icon={Activity} accent="amber">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="MR No.">
                <Input value={mrno} onChange={(e) => setMrno(e.target.value)}
                  placeholder="MR-12345" className={SI} />
              </Field>
              <Field label="TRF">
                <Input value={TRF} onChange={(e) => setTRF(e.target.value)}
                  placeholder="TRF reference" className={SI} />
              </Field>
              <Field label="Tag">
                <Input value={tag} onChange={(e) => setTag(e.target.value)}
                  placeholder="VIP / Priority" className={SI} />
              </Field>
            </div>

            <Field label="Patient History">
              <Textarea rows={3} value={patientHistory} onChange={(e) => setPatientHistory(e.target.value)}
                placeholder="Relevant medical history…"
                className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm placeholder:text-gray-300 resize-none" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Current Medication">
                <Textarea rows={3} value={medication} onChange={(e) => setMedication(e.target.value)}
                  placeholder="List current medications…"
                  className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm placeholder:text-gray-300 resize-none" />
              </Field>
              <Field label="Family History">
                <Textarea rows={3} value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)}
                  placeholder="Known hereditary conditions…"
                  className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm placeholder:text-gray-300 resize-none" />
              </Field>
            </div>

            {/* Lifestyle switches */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Smoking" required>
                <Select value={smoking} onValueChange={(v) => setSmoking(v as Smoking)}>
                  <SelectTrigger className={SI}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="Occasional">Occasional</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="sm:col-span-2 flex gap-6 items-center">
                <div className="flex items-center justify-between flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Alcoholic</p>
                    <p className="text-xs text-gray-400 mt-0.5">Regular alcohol consumption</p>
                  </div>
                  <Switch checked={alcoholic} onCheckedChange={setAlcoholic} />
                </div>
                <div className="flex items-center justify-between flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Patient Consent</p>
                    <p className="text-xs text-gray-400 mt-0.5">Informed consent given</p>
                  </div>
                  <Switch checked={isPatientConsent} onCheckedChange={setIsPatientConsent} />
                </div>
              </div>
            </div>

            <Field label="Medical History">
              <Textarea rows={3} value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Detailed medical history…"
                className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm placeholder:text-gray-300 resize-none" />
            </Field>
          </Section>

          {/* ── Cardiovascular ─────────────────────────────────────────────── */}
          <Section title="Cardiovascular & Vitals" icon={Heart} accent="rose">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Chest Pain" required>
                <Select value={chestPain} onValueChange={(v) => setChestPain(v as YesNo)}>
                  <SelectTrigger className={SI}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Cardiac Enzyme" required>
                <Select value={cardiacEnzyme} onValueChange={(v) => setCardiacEnzyme(v as YesNo)}>
                  <SelectTrigger className={SI}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Lipid Profile</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Cholesterol", value: cholestrol, set: setCholestrol },
                  { label: "HDL", value: hdl, set: setHdl },
                  { label: "LDL", value: ldl, set: setLdl },
                  { label: "Triglycerides", value: triglycerides, set: setTriglycerides },
                ].map(({ label, value, set }) => (
                  <Field key={label} label={label}>
                    <Input value={value} onChange={(e) => set(e.target.value)}
                      placeholder="mg/dL" className={SI} />
                  </Field>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Vital Signs</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Hemoglobin (Hb)">
                  <Input value={hbValue} onChange={(e) => setHbValue(e.target.value)}
                    placeholder="g/dL" className={SI} />
                </Field>
                <Field label="BP Systolic">
                  <Input value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)}
                    placeholder="mmHg" className={SI} />
                </Field>
                <Field label="BP Diastolic">
                  <Input value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)}
                    placeholder="mmHg" className={SI} />
                </Field>
              </div>
            </div>
          </Section>

          {/* ── Submit ─────────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2 pb-8">
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-11 rounded-xl font-semibold shadow-sm shadow-indigo-200 transition-all hover:shadow-md hover:shadow-indigo-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Patient…
                </>
              ) : (
                "Create Patient"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 px-6"
            >
              <Link href="/dashboard/vendor/patients">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}