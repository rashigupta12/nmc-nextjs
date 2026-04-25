'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Upload,
  FileJson,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Dna,
  FlaskConical,
  Hash,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ============================================================================
// Types
// ============================================================================

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

// Grouped structure
interface VariantRow {
  testVariant: string;
  reportVariant: string;
  response: string;
  status: string;
  recommendation: string;
  interpretation: string;
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
  mappedRecords: number;
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
  condition: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getGeneName = (gene: any): string => {
  if (!gene) return '-';
  if (typeof gene === 'string') return gene;
  if (typeof gene === 'object' && 'name' in gene) return String(gene.name);
  return '-';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Good': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Poor': return 'bg-red-50 text-red-700 border-red-200';
    case 'Average': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Normal': return 'bg-sky-50 text-sky-700 border-sky-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getResponseColor = (response: string) => {
  switch (response) {
    case 'Normal': return 'bg-emerald-100 text-emerald-800';
    case 'Medium': return 'bg-amber-100 text-amber-800';
    case 'High': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getResponseDot = (response: string) => {
  switch (response) {
    case 'Normal': return 'bg-emerald-500';
    case 'Medium': return 'bg-amber-500';
    case 'High': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

// Group flat variants into nested structure
function groupVariants(variants: FlattenedVariant[]): ConditionGroup[] {
  const conditionMap = new Map<string, ConditionGroup>();

  for (const v of variants) {
    const geneName = getGeneName(v.gene);
    const condKey = `${v.testId}::${v.conditionName}`;

    if (!conditionMap.has(condKey)) {
      conditionMap.set(condKey, {
        conditionName: v.conditionName,
        conditionCategory: v.conditionCategory,
        sectionName: v.sectionName,
        testName: v.testName,
        testCode: v.testCode,
        testId: v.testId,
        genes: [],
      });
    }

    const condGroup = conditionMap.get(condKey)!;
    let geneGroup = condGroup.genes.find(g => g.geneName === geneName);
    if (!geneGroup) {
      geneGroup = { geneName, rsIds: [] };
      condGroup.genes.push(geneGroup);
    }

    let rsGroup = geneGroup.rsIds.find(r => r.uniqueId === v.uniqueId);
    if (!rsGroup) {
      rsGroup = { uniqueId: v.uniqueId, variants: [] };
      geneGroup.rsIds.push(rsGroup);
    }

    rsGroup.variants.push({
      testVariant: v.testVariant,
      reportVariant: v.reportVariant,
      response: v.response,
      status: v.status,
      recommendation: v.recommendation,
      interpretation: v.interpretation,
      lifestyle: v.lifestyle,
      miscellaneous: v.miscellaneous,
    });
  }

  return Array.from(conditionMap.values());
}

// ============================================================================
// Sub-components
// ============================================================================

function VariantRowCard({ variant }: { variant: VariantRow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${getStatusColor(variant.status)}`}>
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:opacity-80 transition-opacity"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getResponseDot(variant.response)}`} />
        <div className="flex-1 flex items-center gap-4 flex-wrap">
          <span className="text-xs font-semibold">Test Variant:</span>
          <code className="bg-white/60 px-2 py-0.5 rounded font-mono text-xs font-bold">
            {variant.testVariant || '-'}
          </code>
          <span className="text-xs font-semibold">Report Variant:</span>
          <code className="bg-white/60 px-2 py-0.5 rounded font-mono text-xs font-bold">
            {variant.reportVariant || '-'}
          </code>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60`}>
            {variant.response}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60`}>
            {variant.status}
          </span>
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            : <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-current/10 space-y-3 bg-white/30">
          {variant.interpretation && (
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-60 mb-1">Interpretation</div>
              <p className="text-xs leading-relaxed">{variant.interpretation}</p>
            </div>
          )}
          {variant.recommendation && (
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-60 mb-1">Recommendation</div>
              <div
                className="text-xs leading-relaxed prose prose-xs max-w-none"
                dangerouslySetInnerHTML={{ __html: variant.recommendation }}
              />
            </div>
          )}
          {variant.lifestyle && (
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-60 mb-1">Lifestyle</div>
              <p className="text-xs leading-relaxed">{variant.lifestyle}</p>
            </div>
          )}
          {variant.miscellaneous && (
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-60 mb-1">Additional Info</div>
              <p className="text-xs leading-relaxed">{variant.miscellaneous}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RsIdBlock({ rsId }: { rsId: RsIdGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <Hash className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        <span className="font-mono text-sm font-semibold text-gray-700">{rsId.uniqueId}</span>
        <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
          {rsId.variants.length} variant{rsId.variants.length !== 1 ? 's' : ''}
        </span>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          : <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="p-3 space-y-2">
          {rsId.variants.map((v, i) => (
            <VariantRowCard key={i} variant={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function GeneBlock({ gene }: { gene: GeneGroup }) {
  const [open, setOpen] = useState(true);
  const totalVariants = gene.rsIds.reduce((s, r) => s + r.variants.length, 0);

  return (
    <div className="border border-blue-100 rounded-2xl overflow-hidden bg-blue-50/30">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2 flex-1">
          <Dna className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="font-bold text-sm text-blue-900">{gene.geneName}</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] h-4 px-1.5">
            {gene.rsIds.length} RS ID{gene.rsIds.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] h-4 px-1.5">
            {totalVariants} variant{totalVariants !== 1 ? 's' : ''}
          </Badge>
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-blue-400 flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {gene.rsIds.map((rsId, i) => (
            <RsIdBlock key={i} rsId={rsId} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConditionCard({ condition }: { condition: ConditionGroup }) {
  const [open, setOpen] = useState(true);
  const totalVariants = condition.genes.reduce(
    (s, g) => s + g.rsIds.reduce((rs, r) => rs + r.variants.length, 0), 0
  );
  const totalGenes = condition.genes.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Condition Header */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-start gap-4 px-6 py-4 text-left hover:bg-gray-50/80 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-base text-gray-900">{condition.conditionName}</h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
              {condition.conditionCategory || 'General'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <FlaskConical className="h-3 w-3" />
              {condition.testName}
              <span className="opacity-50">({condition.testCode})</span>
            </span>
            <span className="text-xs text-gray-500">{condition.sectionName}</span>
            <span className="text-xs text-gray-400">
              {totalGenes} gene{totalGenes !== 1 ? 's' : ''} · {totalVariants} variant{totalVariants !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {open
            ? <ChevronDown className="h-4 w-4 text-gray-400" />
            : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-6 pb-5 space-y-3 border-t border-gray-100 pt-4">
          {condition.genes.map((gene, i) => (
            <GeneBlock key={i} gene={gene} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function GeneVariantsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [variants, setVariants] = useState<FlattenedVariant[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    response: 'all',
    testId: 'all',
    gene: 'all',
    condition: 'all',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploadTestId, setUploadTestId] = useState<string>('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-dismiss message
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const uniqueGenes = useMemo(() => {
    const genes = new Set(variants.map(v => getGeneName(v.gene)).filter(Boolean));
    return Array.from(genes).sort();
  }, [variants]);

  const uniqueConditions = useMemo(() => {
    const conds = new Set(variants.map(v => v.conditionName).filter(Boolean));
    return Array.from(conds).sort();
  }, [variants]);

  // Group variants
  const groupedConditions = useMemo(() => groupVariants(variants), [variants]);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchTests = useCallback(async () => {
    setLoadingTests(true);
    try {
      const res = await fetch('/api/internalwork/tests?isActive=true');
      const data = await res.json();
      setTests(data.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load tests' });
    } finally {
      setLoadingTests(false);
    }
  }, []);

  const fetchVariants = useCallback(async () => {
    setLoadingVariants(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '200'); // fetch more since we're grouping
    if (filters.search.trim()) params.set('search', filters.search.trim());
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.response !== 'all') params.set('response', filters.response);
    if (filters.testId !== 'all') params.set('testId', filters.testId);
    if (filters.gene !== 'all') params.set('gene', filters.gene);
    if (filters.condition !== 'all') params.set('condition', filters.condition);

    try {
      const res = await fetch(`/api/internalwork/gene-variants?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setVariants(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.total || 0);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load variants' });
        setVariants([]);
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while loading variants' });
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTests(); }, [fetchTests]);
  useEffect(() => { fetchVariants(); }, [fetchVariants]);
  useEffect(() => { setPage(1); }, [filters]);

  const hasActiveFilters = useMemo(() =>
    filters.search !== '' || filters.status !== 'all' || filters.response !== 'all' ||
    filters.testId !== 'all' || filters.gene !== 'all' || filters.condition !== 'all'
  , [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters({
    search: '', status: 'all', response: 'all',
    testId: 'all', gene: 'all', condition: 'all',
  });

  // ============================================================================
  // Upload Handlers
  // ============================================================================

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadSummary(null);
    setUploadError(null);
    try {
      const text = await file.text();
      const clean = text.replace(/^;vte\.shell\.preexec![^\n]*\n/, '');
      const parsed = JSON.parse(clean);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setPreviewData(arr.slice(0, 3));
    } catch {
      setUploadError('Invalid JSON format. Please check your file.');
      setPreviewData([]);
    }
  };

  const handleUpload = async () => {
    if (!uploadTestId) { setUploadError('Please select a test'); return; }
    if (!uploadFile) { setUploadError('Please select a file'); return; }
    const selectedTest = tests.find(t => t.id === uploadTestId);
    if (!selectedTest) { setUploadError('Selected test not found'); return; }

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('testId', selectedTest.id);
    formData.append('testCode', selectedTest.testCode);
    formData.append('testReportName', selectedTest.testName);

    try {
      const res = await fetch('/api/internalwork/gene-variants/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (res.ok) {
        setUploadSummary(result.data);
        setMessage({ type: 'success', text: result.message || 'Upload successful' });
        setTimeout(() => {
          setUploadSheetOpen(false);
          resetUploadForm();
          fetchVariants();
        }, 1800);
      } else {
        setUploadError(result.error || 'Upload failed');
      }
    } catch {
      setUploadError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadSummary(null);
    setUploadError(null);
    setPreviewData([]);
    setUploadTestId('');
    const el = document.getElementById('upload-file-input') as HTMLInputElement;
    if (el) el.value = '';
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-xl text-xl">🧬</span>
              Gene Variants
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              Grouped by condition · gene · RS ID
            </p>
          </div>
          <Button
            onClick={() => setUploadSheetOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-md gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Variants
          </Button>
        </div>

        {/* ── Filters ── */}
        <Card className="mb-6 shadow-sm border-gray-200 bg-white">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search condition, gene, RS ID..."
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.response} onValueChange={v => handleFilterChange('response', v)}>
                <SelectTrigger><SelectValue placeholder="Response" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Responses</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.testId} onValueChange={v => handleFilterChange('testId', v)}>
                <SelectTrigger><SelectValue placeholder="Test" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests</SelectItem>
                  {tests.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.testName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.gene}
                onValueChange={v => handleFilterChange('gene', v)}
                disabled={uniqueGenes.length === 0}
              >
                <SelectTrigger><SelectValue placeholder="Gene" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genes</SelectItem>
                  {uniqueGenes.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 items-center mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Active:
                </span>
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-100"
                  >
                    "{filters.search}" <X className="h-2.5 w-2.5" />
                  </button>
                )}
                {filters.status !== 'all' && (
                  <button
                    onClick={() => handleFilterChange('status', 'all')}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-100"
                  >
                    Status: {filters.status} <X className="h-2.5 w-2.5" />
                  </button>
                )}
                {filters.response !== 'all' && (
                  <button
                    onClick={() => handleFilterChange('response', 'all')}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-100"
                  >
                    Response: {filters.response} <X className="h-2.5 w-2.5" />
                  </button>
                )}
                {filters.testId !== 'all' && (
                  <button
                    onClick={() => handleFilterChange('testId', 'all')}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-100"
                  >
                    Test: {tests.find(t => t.id === filters.testId)?.testName || filters.testId}
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
                {filters.gene !== 'all' && (
                  <button
                    onClick={() => handleFilterChange('gene', 'all')}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-100"
                  >
                    Gene: {filters.gene} <X className="h-2.5 w-2.5" />
                  </button>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-400 hover:text-red-500 underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Stats bar ── */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <span className="text-gray-500">
            {loadingVariants
              ? 'Loading…'
              : `${groupedConditions.length} condition${groupedConditions.length !== 1 ? 's' : ''} · ${totalRecords} variant${totalRecords !== 1 ? 's' : ''} total`
            }
          </span>
          {loadingVariants && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
        </div>

        {/* ── Content ── */}
        {loadingVariants ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-400 text-sm">Loading variants…</p>
          </div>
        ) : groupedConditions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No variants found</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results.'
                : 'Upload genetic variant data to get started.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {groupedConditions.map((condition, i) => (
              <ConditionCard key={`${condition.testId}-${condition.conditionName}-${i}`} condition={condition} />
            ))}

            {/* Pagination (only shown if there are multiple pages) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Toast ── */}
        {message && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm transition-all ${
            message.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}>
            {message.type === 'success'
              ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-2 opacity-70 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Upload Sheet ── */}
      <Sheet open={uploadSheetOpen} onOpenChange={open => { if (!open) resetUploadForm(); setUploadSheetOpen(open); }}>
        <SheetContent className="w-[520px] sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg">
              <FileJson className="h-5 w-5 text-blue-600" />
              Upload Gene Variants
            </SheetTitle>
            <SheetDescription className="text-sm">
              Upload a JSON file with condition → gene → rsIds → variants structure.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 mt-6">
            {/* Test selection — separate from filter state */}
            <div>
              <Label className="text-sm font-medium">Select Test *</Label>
              <Select value={uploadTestId} onValueChange={setUploadTestId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a test…" />
                </SelectTrigger>
                <SelectContent>
                  {tests.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.testName} ({t.testCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {uploadTestId && (() => {
                const t = tests.find(x => x.id === uploadTestId);
                return t && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    TAT: {t.tatDays} days · Price: {t.price ? `₹${t.price}` : 'N/A'}
                  </p>
                );
              })()}
            </div>

            {/* File drop area */}
            <div>
              <Label className="text-sm font-medium">JSON File *</Label>
              <div className={`mt-1.5 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                uploadError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'
              }`}>
                <FileJson className={`mx-auto h-10 w-10 mb-2 ${uploadError ? 'text-red-300' : 'text-gray-300'}`} />
                <Label
                  htmlFor="upload-file-input"
                  className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose file
                </Label>
                <Input
                  id="upload-file-input"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <p className="text-xs text-gray-400 mt-1">JSON only · max 10 MB</p>
              </div>

              {uploadFile && (
                <div className="mt-2 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="font-mono text-xs text-blue-700 truncate">{uploadFile.name}</span>
                  <button
                    onClick={() => { setUploadFile(null); setPreviewData([]); setUploadError(null); }}
                    className="text-xs text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Preview */}
            {previewData.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Preview (first {previewData.length} records)</Label>
                <ScrollArea className="mt-1.5 h-40 border rounded-lg bg-gray-50">
                  <pre className="p-3 text-[10px] font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {uploadError && (
              <Alert variant="destructive" className="text-sm py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploadSummary && (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Upload Successful!</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span>📊 Processed: {uploadSummary.recordsProcessed}</span>
                    <span>✅ Inserted: {uploadSummary.recordsInserted}</span>
                    <span>📋 Conditions: {uploadSummary.conditions?.length}</span>
                    <span>🧬 Genes: {uploadSummary.genes?.length}</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <SheetFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setUploadSheetOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || !uploadTestId || uploading}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {uploading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                : <><Upload className="h-4 w-4" /> Upload</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}