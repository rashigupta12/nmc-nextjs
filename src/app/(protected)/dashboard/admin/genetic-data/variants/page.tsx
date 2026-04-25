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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2, Upload, FileJson, Search, X, AlertCircle,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Test {
  id: string;
  testCode: string;
  testName: string;
  alias: string | null;
  description: string | null;
  tatDays: number;
  price: string | null;
  isActive: boolean;
}

interface FlattenedVariant {
  id: string;
  conditionName: string;
  conditionCategory: string;
  gene: string;
  uniqueId: string;
  testVariant: string;
  reportVariant: string;
  response: string;
  status: string;
  recommendation: string;
  interpretation: string;
  lifestyle: string;
  miscellaneous: string;
  testId: string;
  testCode: string;
  testName: string;
  sectionId: string;
  sectionName: string;
  createdAt: string;
}

interface VariantRow {
  testVariant: string;
  reportVariant: string;
  response: string;
  status: string;
  interpretation: string;
  recommendation: string;
  lifestyle: string;
  miscellaneous: string;
}

interface RsIdGroup {
  uniqueId: string;
  variants: VariantRow[];
}

interface GeneGroup {
  geneName: string;
  rsIds: RsIdGroup[];
}

interface ConditionGroup {
  conditionName: string;
  conditionCategory: string;
  sectionName: string;
  testName: string;
  testCode: string;
  testId: string;
  genes: GeneGroup[];
}

interface UploadSummary {
  testId: string;
  testCode: string;
  testReportName: string;
  recordsProcessed: number;
  recordsInserted: number;
  conditions: string[];
  genes: string[];
  rsIds: string[];
}

interface FilterState {
  search: string;
  status: string;
  response: string;
  testId: string;
  gene: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getGeneName = (gene: any): string => {
  if (!gene) return '-';
  if (typeof gene === 'string') return gene;
  if (typeof gene === 'object' && 'name' in gene) return String(gene.name);
  return '-';
};

const statusClass = (status: string) => {
  const map: Record<string, string> = {
    Good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Poor: 'bg-red-50 text-red-700 border-red-200',
    Average: 'bg-amber-50 text-amber-700 border-amber-200',
    Normal: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return map[status] ?? 'bg-gray-50 text-gray-600 border-gray-200';
};

const responseClass = (response: string) => {
  const map: Record<string, string> = {
    Normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-red-50 text-red-700 border-red-200',
  };
  return map[response] ?? 'bg-gray-50 text-gray-600 border-gray-200';
};

function groupVariants(variants: FlattenedVariant[]): ConditionGroup[] {
  const map = new Map<string, ConditionGroup>();
  for (const v of variants) {
    const geneName = getGeneName(v.gene);
    const key = `${v.testId}::${v.conditionName}`;
    if (!map.has(key)) {
      map.set(key, {
        conditionName: v.conditionName,
        conditionCategory: v.conditionCategory,
        sectionName: v.sectionName,
        testName: v.testName,
        testCode: v.testCode,
        testId: v.testId,
        genes: [],
      });
    }
    const cg = map.get(key)!;
    let gg = cg.genes.find(g => g.geneName === geneName);
    if (!gg) { gg = { geneName, rsIds: [] }; cg.genes.push(gg); }
    let rg = gg.rsIds.find(r => r.uniqueId === v.uniqueId);
    if (!rg) { rg = { uniqueId: v.uniqueId, variants: [] }; gg.rsIds.push(rg); }
    rg.variants.push({
      testVariant: v.testVariant,
      reportVariant: v.reportVariant,
      response: v.response,
      status: v.status,
      interpretation: v.interpretation,
      recommendation: v.recommendation,
      lifestyle: v.lifestyle,
      miscellaneous: v.miscellaneous,
    });
  }
  return Array.from(map.values());
}

// ─────────────────────────────────────────────
// Variant detail row (expandable)
// ─────────────────────────────────────────────

function VariantDetailRow({ variant, index }: { variant: VariantRow; index: number }) {
  const [open, setOpen] = useState(false);
  const hasDetail = variant.interpretation || variant.recommendation || variant.lifestyle || variant.miscellaneous;

  return (
    <>
      <tr className={`border-b border-gray-100 hover:bg-gray-50/70 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
        <td className="py-3 px-4">
          <code className="text-xs font-mono text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">
            {variant.testVariant || '—'}
          </code>
        </td>
        <td className="py-3 px-4">
          <code className="text-xs font-mono text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">
            {variant.reportVariant || '—'}
          </code>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${responseClass(variant.response)}`}>
            {variant.response || '—'}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusClass(variant.status)}`}>
            {variant.status || '—'}
          </span>
        </td>
        <td className="py-3 px-4 text-right">
          {hasDetail && (
            <button
              onClick={() => setOpen(p => !p)}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors select-none"
            >
              {open ? 'Hide' : 'Details'}
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
          )}
        </td>
      </tr>

      {open && hasDetail && (
        <tr className="bg-blue-50/20 border-b border-gray-100">
          <td colSpan={5} className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {variant.interpretation && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Interpretation</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{variant.interpretation}</p>
                </div>
              )}
              {variant.recommendation && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Recommendation</p>
                  <div
                    className="text-xs text-gray-600 leading-relaxed [&_ul]:pl-4 [&_ul]:space-y-0.5 [&_li]:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: variant.recommendation }}
                  />
                </div>
              )}
              {variant.lifestyle && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Lifestyle</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{variant.lifestyle}</p>
                </div>
              )}
              {variant.miscellaneous && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Additional Info</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{variant.miscellaneous}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// RS ID accordion with table
// ─────────────────────────────────────────────

function RsIdAccordion({ rsId }: { rsId: RsIdGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-2 last:mb-0">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group"
      >
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 w-9">RSID</span>
        <span className="font-mono text-xs font-semibold text-gray-700">{rsId.uniqueId}</span>
        <span className="text-xs text-gray-400 ml-auto mr-1">{rsId.variants.length} variant{rsId.variants.length !== 1 ? 's' : ''}</span>
        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-1 rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Test Variant', 'Report Variant', 'Response', 'Status', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`py-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400 ${i === 4 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rsId.variants.map((v, i) => (
                <VariantDetailRow key={i} variant={v} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Gene accordion
// ─────────────────────────────────────────────

function GeneAccordion({ gene }: { gene: GeneGroup }) {
  const [open, setOpen] = useState(true);
  const totalVariants = gene.rsIds.reduce((s, r) => s + r.variants.length, 0);

  return (
    <div className="mb-3 last:mb-0">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left shadow-sm"
      >
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 w-9">Gene</span>
        <span className="font-semibold text-sm text-gray-800">{gene.geneName}</span>
        <div className="ml-3 flex items-center gap-2 text-xs text-gray-400">
          <span>{gene.rsIds.length} RS ID{gene.rsIds.length !== 1 ? 's' : ''}</span>
          <span className="text-gray-300">·</span>
          <span>{totalVariants} variant{totalVariants !== 1 ? 's' : ''}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 ml-auto flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-2 ml-3 pl-4 border-l-2 border-gray-100">
          {gene.rsIds.map((rsId, i) => (
            <RsIdAccordion key={i} rsId={rsId} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Condition accordion (top level)
// ─────────────────────────────────────────────

function ConditionAccordion({ condition, defaultOpen }: { condition: ConditionGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const totalGenes = condition.genes.length;
  const totalVariants = condition.genes.reduce(
    (s, g) => s + g.rsIds.reduce((rs, r) => rs + r.variants.length, 0), 0
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{condition.conditionName}</span>
            {condition.conditionCategory && (
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {condition.conditionCategory}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
            <span>{condition.testName}</span>
            <span className="text-gray-300">·</span>
            <span className="font-mono text-[11px]">{condition.testCode}</span>
            <span className="text-gray-300">·</span>
            <span>{totalGenes} gene{totalGenes !== 1 ? 's' : ''}</span>
            <span className="text-gray-300">·</span>
            <span>{totalVariants} variant{totalVariants !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-6 pb-5 pt-3 border-t border-gray-100">
          {condition.genes.map((gene, i) => (
            <GeneAccordion key={i} gene={gene} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function GeneVariantsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [variants, setVariants] = useState<FlattenedVariant[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '', status: 'all', response: 'all', testId: 'all', gene: 'all',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploadTestId, setUploadTestId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(null), 4000); return () => clearTimeout(t); }
  }, [message]);

  const uniqueGenes = useMemo(() => {
    const s = new Set(variants.map(v => getGeneName(v.gene)).filter(Boolean));
    return Array.from(s).sort();
  }, [variants]);

  const groupedConditions = useMemo(() => groupVariants(variants), [variants]);

  const hasActiveFilters = useMemo(() =>
    filters.search !== '' || filters.status !== 'all' ||
    filters.response !== 'all' || filters.testId !== 'all' || filters.gene !== 'all'
  , [filters]);

  // ── Fetching ──

  const fetchTests = useCallback(async () => {
    setLoadingTests(true);
    try {
      const res = await fetch('/api/internalwork/tests?isActive=true');
      const data = await res.json();
      setTests(data.data || []);
    } catch { setMessage({ type: 'error', text: 'Failed to load tests' }); }
    finally { setLoadingTests(false); }
  }, []);

  const fetchVariants = useCallback(async () => {
    setLoadingVariants(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '200');
    if (filters.search.trim()) params.set('search', filters.search.trim());
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.response !== 'all') params.set('response', filters.response);
    if (filters.testId !== 'all') params.set('testId', filters.testId);
    if (filters.gene !== 'all') params.set('gene', filters.gene);
    try {
      const res = await fetch(`/api/internalwork/gene-variants?${params}`);
      const data = await res.json();
      if (data.success) {
        setVariants(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.total || 0);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load variants' });
        setVariants([]);
      }
    } catch { setMessage({ type: 'error', text: 'Network error' }); setVariants([]); }
    finally { setLoadingVariants(false); }
  }, [page, filters]);

  useEffect(() => { fetchTests(); }, [fetchTests]);
  useEffect(() => { fetchVariants(); }, [fetchVariants]);
  useEffect(() => { setPage(1); }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const clearFilters = () =>
    setFilters({ search: '', status: 'all', response: 'all', testId: 'all', gene: 'all' });

  // ── Upload ──

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file); setUploadSummary(null); setUploadError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text.replace(/^;vte\.shell\.preexec![^\n]*\n/, ''));
      setPreviewData((Array.isArray(parsed) ? parsed : [parsed]).slice(0, 3));
    } catch { setUploadError('Invalid JSON format.'); setPreviewData([]); }
  };

  const handleUpload = async () => {
    if (!uploadTestId) { setUploadError('Please select a test'); return; }
    if (!uploadFile) { setUploadError('Please select a file'); return; }
    const test = tests.find(t => t.id === uploadTestId);
    if (!test) { setUploadError('Test not found'); return; }
    setUploading(true); setUploadError(null);
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('testId', test.id);
    fd.append('testCode', test.testCode);
    fd.append('testReportName', test.testName);
    try {
      const res = await fetch('/api/internalwork/gene-variants/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (res.ok) {
        setUploadSummary(result.data);
        setMessage({ type: 'success', text: result.message || 'Upload successful' });
        setTimeout(() => { setUploadSheetOpen(false); resetUploadForm(); fetchVariants(); }, 1800);
      } else { setUploadError(result.error || 'Upload failed'); }
    } catch { setUploadError('Network error. Please try again.'); }
    finally { setUploading(false); }
  };

  const resetUploadForm = () => {
    setUploadFile(null); setUploadSummary(null);
    setUploadError(null); setPreviewData([]); setUploadTestId('');
    const el = document.getElementById('upload-file-input') as HTMLInputElement;
    if (el) el.value = '';
  };

  // ── Render ──

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className=" mx-auto ">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Gene Variants</h1>
            <p className="text-xs text-gray-500 mt-0.5">Grouped by condition · gene · RS ID</p>
          </div>
          <Button
            onClick={() => setUploadSheetOpen(true)}
            size="sm"
            className="gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs h-8 px-3"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search condition, gene, RS ID…"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                className="pl-8 h-8 text-xs border-gray-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {[
              {
                key: 'testId' as const, placeholder: 'All Tests', w: 'w-40',
                options: [{ value: 'all', label: 'All Tests' }, ...tests.map(t => ({ value: t.id, label: t.testName }))],
              },
              {
                key: 'gene' as const, placeholder: 'All Genes', w: 'w-32',
                options: [{ value: 'all', label: 'All Genes' }, ...uniqueGenes.map(g => ({ value: g, label: g }))],
                disabled: uniqueGenes.length === 0,
              },
              {
                key: 'response' as const, placeholder: 'Response', w: 'w-32',
                options: [
                  { value: 'all', label: 'All Responses' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                ],
              },
              {
                key: 'status' as const, placeholder: 'Status', w: 'w-32',
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'Good', label: 'Good' },
                  { value: 'Average', label: 'Average' },
                  { value: 'Poor', label: 'Poor' },
                  { value: 'Normal', label: 'Normal' },
                ],
              },
            ].map(({ key, placeholder, w, options, disabled }) => (
              <Select
                key={key}
                value={filters[key]}
                onValueChange={v => handleFilterChange(key, v)}
                disabled={disabled}
              >
                <SelectTrigger className={`h-8 ${w} text-xs border-gray-200 bg-gray-50`}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors ml-1"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Active chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-gray-100">
              {filters.search && (
                <FilterChip label={`"${filters.search}"`} onRemove={() => handleFilterChange('search', '')} />
              )}
              {filters.testId !== 'all' && (
                <FilterChip
                  label={tests.find(t => t.id === filters.testId)?.testName ?? filters.testId}
                  onRemove={() => handleFilterChange('testId', 'all')}
                />
              )}
              {filters.gene !== 'all' && (
                <FilterChip label={`Gene: ${filters.gene}`} onRemove={() => handleFilterChange('gene', 'all')} />
              )}
              {filters.response !== 'all' && (
                <FilterChip label={`Response: ${filters.response}`} onRemove={() => handleFilterChange('response', 'all')} />
              )}
              {filters.status !== 'all' && (
                <FilterChip label={`Status: ${filters.status}`} onRemove={() => handleFilterChange('status', 'all')} />
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">
            {loadingVariants
              ? 'Loading…'
              : `${groupedConditions.length} condition${groupedConditions.length !== 1 ? 's' : ''} · ${totalRecords} variant${totalRecords !== 1 ? 's' : ''}`}
          </p>
          {loadingVariants && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
        </div>

        {/* Content */}
        {loadingVariants ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-7 w-7 animate-spin text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Loading variants…</p>
          </div>
        ) : groupedConditions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <AlertCircle className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">No variants found</p>
            <p className="text-xs text-gray-400 max-w-xs">
              {hasActiveFilters ? 'Try adjusting your filters.' : 'Upload genetic variant data to get started.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 text-xs h-8">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {groupedConditions.map((cond, i) => (
                <ConditionAccordion
                  key={`${cond.testId}-${cond.conditionName}-${i}`}
                  condition={cond}
                  defaultOpen={i === 0}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1 text-xs h-8"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="gap-1 text-xs h-8"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Toast */}
        {message && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg text-sm text-white ${
            message.type === 'success' ? 'bg-gray-900' : 'bg-red-600'
          }`}>
            {message.type === 'success'
              ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-2 opacity-60 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Upload Sheet */}
      <Sheet open={uploadSheetOpen} onOpenChange={open => { if (!open) resetUploadForm(); setUploadSheetOpen(open); }}>
        <SheetContent className="w-[460px] sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-5">
            <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileJson className="h-4 w-4 text-gray-500" />
              Upload Gene Variants
            </SheetTitle>
            <SheetDescription className="text-xs text-gray-500">
              Upload a JSON file following the condition → gene → rsIds → variants schema.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            <div>
              <Label className="text-xs font-medium text-gray-700">Test *</Label>
              <Select value={uploadTestId} onValueChange={setUploadTestId}>
                <SelectTrigger className="mt-1.5 h-9 text-sm">
                  <SelectValue placeholder="Select a test…" />
                </SelectTrigger>
                <SelectContent>
                  {tests.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-sm">
                      {t.testName} <span className="text-gray-400">({t.testCode})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {uploadTestId && (() => {
                const t = tests.find(x => x.id === uploadTestId);
                return t && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    TAT: {t.tatDays} days · {t.price ? `₹${t.price}` : 'No price set'}
                  </p>
                );
              })()}
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">JSON File *</Label>
              <label
                htmlFor="upload-file-input"
                className={`mt-1.5 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-7 cursor-pointer transition-colors ${
                  uploadError
                    ? 'border-red-200 bg-red-50/50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FileJson className="h-7 w-7 text-gray-300" />
                <span className="text-xs text-gray-500 text-center">
                  {uploadFile ? uploadFile.name : <>Click to choose · <span className="text-gray-400">JSON · max 10 MB</span></>}
                </span>
                <input
                  id="upload-file-input"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              {uploadFile && (
                <div className="mt-2 flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                  <span className="font-mono text-[11px] text-gray-500 truncate">{uploadFile.name}</span>
                  <button
                    onClick={() => { setUploadFile(null); setPreviewData([]); setUploadError(null); }}
                    className="text-xs text-red-400 hover:text-red-600 ml-3 flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {previewData.length > 0 && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Preview</Label>
                <ScrollArea className="mt-1.5 h-32 border border-gray-200 rounded-lg bg-gray-50">
                  <pre className="p-3 text-[10px] font-mono whitespace-pre-wrap break-all text-gray-500">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {uploadError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploadSummary && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Upload Successful
                </p>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-emerald-700">
                  <span>Processed: {uploadSummary.recordsProcessed}</span>
                  <span>Inserted: {uploadSummary.recordsInserted}</span>
                  <span>Conditions: {uploadSummary.conditions?.length}</span>
                  <span>Genes: {uploadSummary.genes?.length}</span>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="mt-7 gap-2">
            <Button variant="outline" size="sm" onClick={() => setUploadSheetOpen(false)} className="text-xs h-8">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={!uploadFile || !uploadTestId || uploading}
              className="gap-1.5 bg-gray-900 hover:bg-gray-700 text-xs h-8"
            >
              {uploading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</>
                : <><Upload className="h-3.5 w-3.5" /> Upload</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─────────────────────────────────────────────
// Filter chip helper
// ─────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors">
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}