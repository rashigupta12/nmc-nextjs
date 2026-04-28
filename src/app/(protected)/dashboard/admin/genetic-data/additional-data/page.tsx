/*eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2, Upload, FileJson, Search, X, AlertCircle,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  Trash2, Pill, FlaskConical, Activity,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// ── Constants ──────────────────────────────────────────────────────────────────

const DRUG_TEST_CODES = new Set(['NMC_CLOPI', 'NMC_WAC', 'NMC_STN']);

const DRUG_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  NMC_CLOPI: { label: 'Clopidogrel',  icon: <Pill className="h-3.5 w-3.5" /> },
  NMC_WAC:   { label: 'Warfarin',     icon: <FlaskConical className="h-3.5 w-3.5" /> },
  NMC_STN:   { label: 'Statin',       icon: <Activity className="h-3.5 w-3.5" /> },
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface Test {
  id: string;
  testCode: string;
  testName: string;
  alias: string | null;
  tatDays: number;
  price: string | null;
  isActive: boolean;
}

interface Recommendation {
  status: string;
  recommendation?: string;
  interpretation?: string;
  nutrition?: string;
  lifestyle?: string;
  miscellaneous?: string;
  additionalInfo?: any;
}

interface GenericReportRecord {
  _id: string;
  testId: string;
  testCode: string;
  testReportName: string;
  conditionName?: string;
  data: Recommendation[];
  createdAt: string;
  updatedAt: string;
}

interface ConditionGroup {
  condition: string;
  testId: string;
  testName: string;
  testCode: string;
  isDrug: boolean;
  records: GenericReportRecord[];
}

// ── Group helper ───────────────────────────────────────────────────────────────

function groupRecords(records: GenericReportRecord[]): ConditionGroup[] {
  const map = new Map<string, ConditionGroup>();

  for (const rec of records) {
    const conditionName = rec.conditionName ?? 'General';
    const key = `${rec.testId}::${conditionName}`;

    if (!map.has(key)) {
      map.set(key, {
        condition: conditionName,
        testId: rec.testId,
        testName: rec.testReportName,
        testCode: rec.testCode,
        isDrug: DRUG_TEST_CODES.has(rec.testCode),
        records: [],
      });
    }
    map.get(key)!.records.push(rec);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.testName.localeCompare(b.testName) || a.condition.localeCompare(b.condition)
  );
}

// ── Badge helper ───────────────────────────────────────────────────────────────

function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = status.toLowerCase();
  if (s.includes('poor') || s.includes('high') || s.includes('ultra'))
    return 'destructive';
  if (s.includes('average') || s.includes('intermediate'))
    return 'secondary';
  if (
    s.includes('good') ||
    s.includes('normal') ||
    s.includes('extensive')
  )
    return 'default';
  return 'outline';
}

// ── Drug additional info renderer ──────────────────────────────────────────────

function DrugAdditionalInfo({ info, testCode }: { info: any; testCode: string }) {
  if (!info) return null;

  if (testCode === 'NMC_CLOPI') {
    return (
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs bg-blue-50 rounded-md p-3">
        <div><span className="font-semibold text-blue-700">CYP2C19*2:</span> <span className="text-gray-700">{info.cyp2c19_2}</span></div>
        <div><span className="font-semibold text-blue-700">CYP2C19*3:</span> <span className="text-gray-700">{info.cyp2c19_3}</span></div>
        <div><span className="font-semibold text-blue-700">CYP2C19*17:</span> <span className="text-gray-700">{info.cyp2c19_17}</span></div>
        <div><span className="font-semibold text-blue-700">Genotype:</span> <span className="font-mono text-gray-700">{info.combinedGenotype}</span></div>
        {info.implications && (
          <div className="col-span-2 mt-1">
            <span className="font-semibold text-blue-700">Implications:</span>
            <p className="text-gray-600 mt-0.5">{info.implications}</p>
          </div>
        )}
      </div>
    );
  }

  if (testCode === 'NMC_WAC') {
    return (
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs bg-purple-50 rounded-md p-3">
        <div><span className="font-semibold text-purple-700">CYP2C9*2:</span> <span className="text-gray-700">{info.cyp2c9_2}</span></div>
        <div><span className="font-semibold text-purple-700">CYP2C9*3:</span> <span className="text-gray-700">{info.cyp2c9_3}</span></div>
        <div className="col-span-2"><span className="font-semibold text-purple-700">Genotype:</span> <span className="font-mono text-gray-700">{info.combinedGenotype}</span></div>
        {info.implications && (
          <div className="col-span-2 mt-1">
            <span className="font-semibold text-purple-700">Implications:</span>
            <p className="text-gray-600 mt-0.5">{info.implications}</p>
          </div>
        )}
      </div>
    );
  }

  if (testCode === 'NMC_STN') {
    return (
      <div className="mt-2 text-xs bg-green-50 rounded-md p-3">
        <p className="font-semibold text-green-700 mb-2">Dosage by Genotype</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'TT', value: info.TT },
            { label: 'TC', value: info.TC },
            { label: 'CC', value: info.CC },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded border border-green-200 p-2 text-center">
              <p className="font-bold text-green-800">{label}</p>
              <p className="text-gray-700 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {info.implications && (
          <div className="mt-2">
            <span className="font-semibold text-green-700">Implications:</span>
            <p className="text-gray-600 mt-0.5">{info.implications}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ── Recommendation card ────────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  testCode,
}: {
  rec: Recommendation;
  testCode: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDrug = DRUG_TEST_CODES.has(testCode);

  const hasContent =
    rec.recommendation ||
    rec.interpretation ||
    rec.nutrition ||
    rec.lifestyle ||
    rec.miscellaneous ||
    rec.additionalInfo;

  return (
    <div className="border border-gray-100 rounded-lg bg-white overflow-hidden">
      {/* Status row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <Badge variant={getStatusVariant(rec.status)}>{rec.status}</Badge>
        {rec.additionalInfo?.combinedGenotype && (
          <span className="font-mono text-xs text-gray-400">
            {rec.additionalInfo.combinedGenotype}
          </span>
        )}
        {rec.additionalInfo?.drug && (
          <span className="text-xs text-gray-500 font-medium">
            {rec.additionalInfo.drug}
          </span>
        )}
        <ChevronDown
          className={`ml-auto h-3.5 w-3.5 text-gray-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded content */}
      {expanded && hasContent && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-2 text-sm">
          {rec.recommendation && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                Recommendation
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: rec.recommendation }}
              />
            </div>
          )}
          {rec.interpretation && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                Interpretation
              </p>
              <p className="text-gray-700">{rec.interpretation}</p>
            </div>
          )}
          {rec.nutrition && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                Nutrition
              </p>
              <p
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: rec.nutrition }}
              />
            </div>
          )}
          {rec.lifestyle && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                Lifestyle
              </p>
              <p
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: rec.lifestyle }}
              />
            </div>
          )}
          {rec.miscellaneous && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                Miscellaneous
              </p>
              <p
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: rec.miscellaneous }}
              />
            </div>
          )}
          {isDrug && rec.additionalInfo && (
            <DrugAdditionalInfo info={rec.additionalInfo} testCode={testCode} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Condition accordion ────────────────────────────────────────────────────────

function ConditionAccordion({
  group,
  defaultOpen,
  onDeleteTest,
}: {
  group: ConditionGroup;
  defaultOpen: boolean;
  onDeleteTest: (testId: string, testName: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Collect all recommendations across records
  const allRecs: Recommendation[] = group.records.flatMap((r) => r.data);
  const drugLabel = DRUG_LABELS[group.testCode];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex-1 flex items-center gap-3 text-left min-w-0"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 truncate">
                {group.condition}
              </span>
              {group.isDrug && drugLabel && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {drugLabel.icon} {drugLabel.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
              <span>{group.testName}</span>
              <span>·</span>
              <span className="font-mono">{group.testCode}</span>
              <span>·</span>
              <span>{allRecs.length} status entry(ies)</span>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Delete whole test button */}
        <button
          onClick={() => onDeleteTest(group.testId, group.testName)}
          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          title={`Delete all data for ${group.testName}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Recommendation cards */}
      {open && (
        <div className="px-5 pb-4 pt-2 border-t border-gray-100 space-y-2">
          {allRecs.length === 0 ? (
            <p className="text-xs text-gray-400">No recommendation data.</p>
          ) : (
            allRecs.map((rec, idx) => (
              <RecommendationCard key={idx} rec={rec} testCode={group.testCode} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── JSON format hint ───────────────────────────────────────────────────────────

function FormatHint({ testCode }: { testCode: string }) {
  if (!testCode) return null;

  const hints: Record<string, { title: string; sample: string }> = {
    NMC_CLOPI: {
      title: 'Clopidogrel format',
      sample: `[
  {
    "id": 1,
    "CYP2C19*2": "*1*1",
    "CYP2C19*3": "*1*1",
    "CYP2C19*17": "*1*1",
    "combined_genotype": "*1/*1",
    "status": "Extensive Metabolizer",
    "implications": "Normal platelet inhibition...",
    "recommendation": "Label recommended dosage"
  }
]`,
    },
    NMC_WAC: {
      title: 'Warfarin format',
      sample: `[
  {
    "id": 1,
    "CYP2C19*2": "*1/*1",
    "CYP2C19*3": "*1/*1",
    "combined_genotype": "*1/*1",
    "status": "Normal Metabolizer",
    "recommendation": "..."
  }
]`,
    },
    NMC_STN: {
      title: 'Statin format',
      sample: `[
  {
    "id": 1,
    "drug": "Simvastatin",
    "TT": "80(mg/day)",
    "TC": "40(mg/day)",
    "CC": "20(mg/day)",
    "status": "Normal myopathy risk",
    "recommendation": "..."
  }
]`,
    },
  };

  const standard = {
    title: 'Standard format',
    sample: `[
  {
    "condition_name": "Ankylosing Spondylitis",
    "status": "Good",
    "recommendation": "...",
    "interpretation": "...",
    "recomNutrition": "...",
    "lifeStyle": "...",
    "miscellaneous": "..."
  }
]`,
  };

  const hint = hints[testCode] ?? standard;

  return (
    <div className="mt-3 rounded-md border border-dashed border-gray-200 bg-gray-50 p-3">
      <p className="text-[11px] font-semibold text-gray-500 mb-1">{hint.title}</p>
      <pre className="text-[10px] text-gray-500 overflow-x-auto whitespace-pre-wrap">
        {hint.sample}
      </pre>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function GenericReportRecommendationPage() {
  const [tests, setTests]     = useState<Test[]>([]);
  const [records, setRecords] = useState<GenericReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search:  '',
    testId:  'all',
    status:  'all',
  });
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Upload state
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [uploadFile,      setUploadFile]      = useState<File | null>(null);
  const [uploadTestId,    setUploadTestId]    = useState('');
  const [uploading,       setUploading]       = useState(false);
  const [uploadError,     setUploadError]     = useState<string | null>(null);
  const [uploadSuccess,   setUploadSuccess]   = useState(false);
  const [previewData,     setPreviewData]     = useState<any[]>([]);

  // Delete state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    testId: string;
    testName: string;
  }>({ open: false, testId: '', testName: '' });
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchTests = useCallback(async () => {
    try {
      const res  = await fetch('/api/internalwork/tests?isActive=true');
      const data = await res.json();
      setTests(data.data ?? []);
    } catch {
      showToast('error', 'Failed to load tests');
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page',  page.toString());
    params.set('limit', '50');
    if (filters.search)           params.set('search',  filters.search);
    if (filters.testId !== 'all') params.set('testId',  filters.testId);
    if (filters.status !== 'all') params.set('status',  filters.status);

    try {
      const res  = await fetch(
        `/api/internalwork/generic-report-recommendation?${params}`
      );
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalRecords(data.pagination.total);
      } else {
        showToast('error', data.error ?? 'Failed to load');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTests(); }, [fetchTests]);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { setPage(1); }, [filters]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const grouped = useMemo(() => groupRecords(records), [records]);

  const uniqueStatuses = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.data.forEach((d) => s.add(d.status)));
    return Array.from(s).sort();
  }, [records]);

  const selectedTest = useMemo(
    () => tests.find((t) => t.id === uploadTestId),
    [tests, uploadTestId]
  );

  // ── Toast ──────────────────────────────────────────────────────────────────

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Upload handlers ────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      const text   = await file.text();
      const parsed = JSON.parse(text);
      setPreviewData(Array.isArray(parsed) ? parsed.slice(0, 2) : [parsed]);
    } catch {
      setUploadError('Invalid JSON format');
      setPreviewData([]);
    }
  };

  const handleUpload = async () => {
    if (!uploadTestId || !uploadFile) {
      setUploadError('Please select a test and upload a file');
      return;
    }
    const test = tests.find((t) => t.id === uploadTestId);
    if (!test) {
      setUploadError('Selected test not found');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const fd = new FormData();
    fd.append('file',           uploadFile);
    fd.append('testId',         test.id);
    fd.append('testCode',       test.testCode);
    fd.append('testReportName', test.testName);

    try {
      const res    = await fetch(
        '/api/internalwork/generic-report-recommendation',
        { method: 'POST', body: fd }
      );
      const result = await res.json();

      if (res.ok && result.success) {
        setUploadSuccess(true);
        showToast('success', result.message);
        setTimeout(() => {
          setUploadSheetOpen(false);
          resetUploadForm();
          fetchRecords();
        }, 1200);
      } else {
        setUploadError(result.error ?? 'Upload failed');
      }
    } catch {
      setUploadError('Network error');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTestId('');
    setUploadError(null);
    setUploadSuccess(false);
    setPreviewData([]);
    const input = document.getElementById(
      'upload-file-input'
    ) as HTMLInputElement;
    if (input) input.value = '';
  };

  // ── Delete handlers ────────────────────────────────────────────────────────

  const handleDeleteTest = async () => {
    if (!deleteDialog.testId) return;
    setDeleting(true);
    try {
      const res    = await fetch(
        `/api/internalwork/generic-report-recommendation?testId=${deleteDialog.testId}`,
        { method: 'DELETE' }
      );
      const result = await res.json();
      if (result.success) {
        showToast(
          'success',
          `Deleted ${result.deletedCount} record(s) for "${deleteDialog.testName}"`
        );
        fetchRecords();
      } else {
        showToast('error', result.error ?? 'Delete failed');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, testId: '', testName: '' });
    }
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.testId !== 'all' ||
    filters.status !== 'all';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="mx-auto">
        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Generic Report Recommendations
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage recommendations by condition, genotype, or drug
            </p>
          </div>
          <Button
            onClick={() => setUploadSheetOpen(true)}
            size="sm"
            className="gap-1.5"
          >
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-gray-500">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Condition, test name, test code..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, search: e.target.value }))
                  }
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {/* Test filter */}
            <div className="w-52">
              <Label className="text-xs text-gray-500">Test</Label>
              <Select
                value={filters.testId}
                onValueChange={(v) =>
                  setFilters((p) => ({ ...p, testId: v }))
                }
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue placeholder="All Tests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests</SelectItem>
                  {tests.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.testName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div className="w-52">
              <Label className="text-xs text-gray-500">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) =>
                  setFilters((p) => ({ ...p, status: v }))
                }
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({ search: '', testId: 'all', status: 'all' })
                }
                className="h-9 px-3 mt-5"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-gray-400">
            {loading
              ? 'Loading...'
              : `${totalRecords} record(s) · ${grouped.length} condition group(s)`}
          </p>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">
            <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No data found. Upload a JSON file to get started.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports standard conditions, Clopidogrel, Warfarin, and Statin
              formats.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map((group, idx) => (
              <ConditionAccordion
                key={`${group.testId}-${group.condition}-${idx}`}
                group={group}
                defaultOpen={idx === 0}
                onDeleteTest={(testId, testName) =>
                  setDeleteDialog({ open: true, testId, testName })
                }
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-gray-500 self-center">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Upload sheet ── */}
      <Sheet
        open={uploadSheetOpen}
        onOpenChange={(open) => {
          if (!open) resetUploadForm();
          setUploadSheetOpen(open);
        }}
      >
        <SheetContent className="w-[520px] sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>Upload Recommendations</SheetTitle>
            <SheetDescription>
              Select a test then upload the matching JSON file. Drug tests
              (Clopidogrel, Warfarin, Statin) use their own column formats.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 mt-4 pr-1">
            <div className="space-y-5">
              {/* Test selector */}
              <div>
                <Label>Test *</Label>
                <Select
                  value={uploadTestId}
                  onValueChange={(v) => {
                    setUploadTestId(v);
                    setUploadError(null);
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a test" />
                  </SelectTrigger>
                  <SelectContent>
                    {tests.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span>{t.testName}</span>
                        <span className="ml-1.5 text-xs text-gray-400 font-mono">
                          ({t.testCode})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Drug badge */}
                {selectedTest && DRUG_TEST_CODES.has(selectedTest.testCode) && (
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {DRUG_LABELS[selectedTest.testCode]?.icon}
                    Drug test — uses special column format
                  </div>
                )}
              </div>

              {/* File upload */}
              <div>
                <Label>JSON File *</Label>
                <label
                  htmlFor="upload-file-input"
                  className="mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <FileJson className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {uploadFile ? uploadFile.name : 'Click to choose .json file'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    JSON array format
                  </span>
                  <input
                    id="upload-file-input"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Format hint */}
              {selectedTest && (
                <FormatHint testCode={selectedTest.testCode} />
              )}

              {/* Preview */}
              {previewData.length > 0 && (
                <div>
                  <Label className="text-xs">
                    Preview (first {previewData.length} row(s))
                  </Label>
                  <ScrollArea className="h-36 border rounded-md bg-gray-50 p-2 mt-1">
                    <pre className="text-[10px] font-mono text-gray-600">
                      {JSON.stringify(previewData, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {/* Alerts */}
              {uploadError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
              {uploadSuccess && (
                <Alert className="border-green-200 bg-green-50 text-green-800 py-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Upload successful!</AlertDescription>
                </Alert>
              )}
            </div>
          </ScrollArea>

          <SheetFooter className="mt-4 gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setUploadSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || !uploadTestId || uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Delete confirm dialog ── */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !deleting && setDeleteDialog((p) => ({ ...p, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all data for this test?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all recommendation records for{' '}
              <strong>{deleteDialog.testName}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm text-white z-50 ${
            toast.type === 'success' ? 'bg-gray-800' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          {toast.text}
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}