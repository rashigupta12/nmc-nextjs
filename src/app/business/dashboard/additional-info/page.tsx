// src/app/(protected)/business/dashboard/additional-info/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  X,
  RefreshCw,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gene {
  gene:           string;
  uniqueId:       string;
  test_variant:   string;
  report_variant: string;
  response:       string;
  sectionId:      string;
  status:         string;
}

interface ConditionState {
  conditionName:  string;
  genes:          Gene[];
  selectedStatus: string;
  statusOptions:  string[];
  recommendation: string;
  interpretation: string;
  nutrition:      string;
  lifestyle:      string;
  miscellaneous:  string;
  isSaved:        boolean;  // was this previously saved by a doctor?
}

interface TemplateEntry {
  status:          string;
  recommendation?: string;
  interpretation?: string;
  nutrition?:      string;
  lifestyle?:      string;
  miscellaneous?:  string;
}

interface Template {
  conditionName: string;
  data:          TemplateEntry[];
}

// ─── Status badge colors ──────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Good:    "bg-green-100 text-green-700 border border-green-200",
  Normal:  "bg-green-100 text-green-700 border border-green-200",
  Average: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Poor:    "bg-red-100 text-red-700 border border-red-200",
  Bad:     "bg-red-100 text-red-700 border border-red-200",
};

const getStatusColor = (s: string) =>
  STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600 border border-gray-200";

// ─── Small icon button ────────────────────────────────────────────────────────

function IconBtn({
  onClick,
  title,
  children,
  disabled,
}: {
  onClick:   () => void;
  title:     string;
  children:  React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

// ─── Editable textarea with reset / clear icons ────────────────────────────────

function FieldBox({
  label,
  value,
  placeholder,
  templateValue,
  onChange,
  disabled,
}: {
  label:         string;
  value:         string;
  placeholder?:  string;
  templateValue: string;
  onChange:      (v: string) => void;
  disabled?:     boolean;
}) {
  const isDirty = value !== templateValue && templateValue !== "";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-600">{label}</span>
          {isDirty && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
              title="Modified from template"
            />
          )}
        </div>
        <div className="flex gap-0.5">
          <IconBtn
            title="Reset to template"
            onClick={() => onChange(templateValue)}
            disabled={disabled || !templateValue}
          >
            <RefreshCw className="h-3 w-3" />
          </IconBtn>
          <IconBtn
            title="Clear"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <Trash2 className="h-3 w-3" />
          </IconBtn>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}…`}
        rows={5}
        className="w-full flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 resize-y focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-300 bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdditionalInfoPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // URL params — sampleId may be human-readable or UUID, API resolves it
  const patientId = searchParams.get("patientId") ?? "";
  const sampleId  = searchParams.get("sampleId")  ?? "";
  const testId    = searchParams.get("testId")     ?? "";

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [toast, setToast]       = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Resolved UUIDs — the API returns these and we use them for save
  const [resolvedPatientId, setResolvedPatientId] = useState("");
  const [resolvedSampleId,  setResolvedSampleId]  = useState("");

  const [patientName,     setPatientName]     = useState("");
  const [testCode,        setTestCode]        = useState("");
  const [testReportName,  setTestReportName]  = useState("");
  const [isExistingReport, setIsExistingReport] = useState(false);
  const [templates,       setTemplates]       = useState<Template[]>([]);
  const [conditions,      setConditions]      = useState<ConditionState[]>([]);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!patientId || !sampleId || !testId) {
      setError("Missing required parameters: patientId, sampleId, and testId are all required.");
      setLoading(false);
      return;
    }
    try {
      const res  = await fetch(
        `/api/additional-info?patientId=${encodeURIComponent(patientId)}&sampleId=${encodeURIComponent(sampleId)}&testId=${encodeURIComponent(testId)}`
      );
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Failed to load gene data");
        return;
      }

      // Store resolved UUIDs for the save call
      setResolvedPatientId(data.patientId);
      setResolvedSampleId(data.sampleId);

      setPatientName(data.patientName ?? "");
      setTestCode(data.testCode ?? "");
      setTestReportName(data.testReportName ?? "");
      setIsExistingReport(data.isExistingReport ?? false);
      setTemplates(data.templates ?? []);
      setConditions(data.conditions ?? []);
    } catch {
      setError("Network error — could not load additional info. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [patientId, sampleId, testId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Status change → auto-fill from template ───────────────────────────────

  const handleStatusChange = (conditionName: string, status: string) => {
    setConditions((prev) =>
      prev.map((c) => {
        if (c.conditionName !== conditionName) return c;

        const tmpl  = templates.find(
          (t) => t.conditionName?.toLowerCase().trim() === conditionName.toLowerCase().trim()
        );
        const entry = tmpl?.data.find(
          (d) => d.status?.toLowerCase() === status.toLowerCase()
        );

        return {
          ...c,
          selectedStatus: status,
          // Auto-fill text fields from template when status changes
          recommendation: entry?.recommendation ?? "",
          interpretation: entry?.interpretation ?? "",
          nutrition:      entry?.nutrition       ?? "",
          lifestyle:      entry?.lifestyle       ?? "",
          miscellaneous:  entry?.miscellaneous   ?? "",
        };
      })
    );
  };

  // ── Field change ──────────────────────────────────────────────────────────

  const handleField = (
    conditionName: string,
    field: keyof ConditionState,
    value: string
  ) => {
    setConditions((prev) =>
      prev.map((c) =>
        c.conditionName === conditionName ? { ...c, [field]: value } : c
      )
    );
  };

  // Helper: get template value for a field + condition's current status
  const getTemplateValue = (
    conditionName: string,
    status: string,
    field: keyof TemplateEntry
  ): string => {
    const tmpl  = templates.find(
      (t) => t.conditionName?.toLowerCase().trim() === conditionName.toLowerCase().trim()
    );
    const entry = tmpl?.data.find(
      (d) => d.status?.toLowerCase() === status.toLowerCase()
    );
    return (entry?.[field] as string) ?? "";
  };

  // ── Validate before save ──────────────────────────────────────────────────

  const validateConditions = (): string | null => {
    for (const c of conditions) {
      if (!c.selectedStatus || c.selectedStatus.trim() === "") {
        return `Please select a status for condition: "${c.conditionName}"`;
      }
    }
    return null;
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const validationError = validateConditions();
    if (validationError) {
      setToast({ type: "error", text: validationError });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/final-report/save", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Use resolved UUIDs — not the raw URL params which may be human-readable
          patientId:      resolvedPatientId,
          sampleId:       resolvedSampleId,
          testId,
          testCode,
          testReportName,
          data: conditions.map((c) => ({
            conditionName:  c.conditionName,
            status:         c.selectedStatus,
            recommendation: c.recommendation,
            interpretation: c.interpretation,
            nutrition:      c.nutrition,
            lifestyle:      c.lifestyle,
            miscellaneous:  c.miscellaneous,
            genes: c.genes.map((g) => ({
              gene:     g.gene,
              uniqueId: g.uniqueId,
              response: g.response,
            })),
          })),
        }),
      });

      const result = await res.json();

      if (result.success) {
        setIsExistingReport(true);
        // Mark all conditions as saved
        setConditions((prev) => prev.map((c) => ({ ...c, isSaved: true })));
        setToast({ type: "success", text: "Report saved successfully!" });
      } else {
        setToast({ type: "error", text: result.error ?? "Save failed. Please try again." });
      }
    } catch {
      setToast({ type: "error", text: "Network error during save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-400">Loading gene data…</span>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setError(null); setLoading(true); fetchData(); }}>
              <RefreshCw className="h-4 w-4 mr-1" /> Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty data state ─────────────────────────────────────────────────────

  if (conditions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Info className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-4">No gene conditions found for this sample and test.</p>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main layout ──────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className=" mx-auto px-4 py-5">

        {/* ── Page title ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-semibold text-gray-700">
              {testReportName ? `${testReportName} — Additional Patient Details` : "Additional Patient Details"}
            </h1>
          </div>
          {isExistingReport && (
            <span className="text-sm text-teal-600 bg-teal-50 border border-teal-200 px-2 py-1 rounded flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Previously saved
            </span>
          )}
        </div>

        {/* ── White card ────────────────────────────────────────────────── */}
        <div className="bg-white rounded border border-gray-200 px-6 py-5">

          <h2 className="text-sm font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Additional Details
          </h2>

          {/* Patient / Test info row */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500 whitespace-nowrap">Patient Name</label>
              <input
                readOnly
                value={patientName || "—"}
                className="text-sm border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-600 w-48"
              />
            </div>
            {testCode && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-500 whitespace-nowrap">Test Code</label>
                <input
                  readOnly
                  value={testCode}
                  className="text-sm border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-600 w-32 font-mono"
                />
              </div>
            )}
          </div>

          {/* ── Condition sections ──────────────────────────────────────── */}
          {conditions.map((condition, ci) => (
            <div key={condition.conditionName} className={ci > 0 ? "mt-8" : ""}>

              {/* Condition name + saved badge */}
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  {condition.conditionName}
                </h3>
                {condition.isSaved && (
                  <span className="text-sm text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                    Saved
                  </span>
                )}
              </div>

              {/* Status row */}
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm text-gray-500 w-12 shrink-0">Status</label>
                <select
                  value={condition.selectedStatus}
                  onChange={(e) =>
                    handleStatusChange(condition.conditionName, e.target.value)
                  }
                  className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white min-w-[160px]"
                >
                  <option value="">Select Status</option>
                  {(condition.statusOptions.length > 0
                    ? condition.statusOptions
                    : ["Good", "Average", "Poor"]
                  ).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {condition.selectedStatus && (
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded-full ${getStatusColor(condition.selectedStatus)}`}
                  >
                    {condition.selectedStatus}
                  </span>
                )}
                {/* Warn if no status selected */}
                {!condition.selectedStatus && (
                  <span className="text-sm text-amber-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Required
                  </span>
                )}
              </div>

              {/* Gene table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      <th className="text-left px-2 py-1.5 font-medium">Gene</th>
                      <th className="text-left px-2 py-1.5 font-medium">Unique Id</th>
                      <th className="text-left px-2 py-1.5 font-medium">Test Variant</th>
                      <th className="text-left px-2 py-1.5 font-medium">Report Variant</th>
                      <th className="text-left px-2 py-1.5 font-medium">Response</th>
                      <th className="text-left px-2 py-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {condition.genes.map((gene, gi) => (
                      <tr
                        key={`${gene.uniqueId}-${gene.gene}`}
                        className={gi % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-2 py-1.5 text-gray-700">{gene.gene}</td>
                        <td className="px-2 py-1.5 text-gray-500 font-mono">{gene.uniqueId}</td>
                        <td className="px-2 py-1.5 text-gray-600 font-mono">{gene.test_variant}</td>
                        <td className="px-2 py-1.5 text-gray-600 font-mono">{gene.report_variant}</td>
                        <td className="px-2 py-1.5 text-gray-600">{gene.response}</td>
                        <td className="px-2 py-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded-sm text-sm font-medium ${getStatusColor(gene.status)}`}
                          >
                            {gene.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Text field grid ──────────────────────────────────── */}
              {/* Row 1: Lifestyle | Nutrition */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <FieldBox
                  label="Lifestyle Recommendation"
                  value={condition.lifestyle}
                  templateValue={getTemplateValue(condition.conditionName, condition.selectedStatus, "lifestyle")}
                  onChange={(v) => handleField(condition.conditionName, "lifestyle", v)}
                  disabled={!condition.selectedStatus}
                />
                <FieldBox
                  label="Nutrition Recommendation"
                  value={condition.nutrition}
                  templateValue={getTemplateValue(condition.conditionName, condition.selectedStatus, "nutrition")}
                  onChange={(v) => handleField(condition.conditionName, "nutrition", v)}
                  disabled={!condition.selectedStatus}
                />
              </div>

              {/* Row 2: Miscellaneous | Interpretation */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <FieldBox
                  label="Miscellaneous Recommendation"
                  value={condition.miscellaneous}
                  templateValue={getTemplateValue(condition.conditionName, condition.selectedStatus, "miscellaneous")}
                  onChange={(v) => handleField(condition.conditionName, "miscellaneous", v)}
                  disabled={!condition.selectedStatus}
                />
                <FieldBox
                  label="Interpretation"
                  value={condition.interpretation}
                  templateValue={getTemplateValue(condition.conditionName, condition.selectedStatus, "interpretation")}
                  onChange={(v) => handleField(condition.conditionName, "interpretation", v)}
                  disabled={!condition.selectedStatus}
                />
              </div>

              {/* Row 3: Recommendation (full width) */}
              <div className="mb-1">
                <FieldBox
                  label="Recommendation"
                  value={condition.recommendation}
                  templateValue={getTemplateValue(condition.conditionName, condition.selectedStatus, "recommendation")}
                  onChange={(v) => handleField(condition.conditionName, "recommendation", v)}
                  disabled={!condition.selectedStatus}
                />
              </div>

              {/* Divider between conditions */}
              {ci < conditions.length - 1 && (
                <hr className="mt-6 border-gray-100" />
              )}
            </div>
          ))}

          {/* ── Submit button ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              {conditions.filter((c) => !c.selectedStatus).length > 0
                ? `${conditions.filter((c) => !c.selectedStatus).length} condition(s) still need a status`
                : "All conditions have a status selected"}
            </p>
            <Button
              onClick={handleSave}
              disabled={saving || conditions.some((c) => !c.selectedStatus)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-6 py-2 h-auto gap-1.5 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? "Saving…" : isExistingReport ? "Update Report" : "Submit"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm text-white ${
            toast.type === "success" ? "bg-teal-600" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.text}
          <button onClick={() => setToast(null)} className="ml-1 opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}