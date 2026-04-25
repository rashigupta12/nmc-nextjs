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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2, Upload, FileJson, Search, X, AlertCircle,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ========== Types ==========
interface Test {
  id: string;
  testCode: string;
  testName: string;
  alias: string | null;
  tatDays: number;
  price: string | null;
  isActive: boolean;
}

interface GenePageRecord {
  _id: string;
  testId: string;
  testCode: string;
  testReportName: string;
  unique_id?: string;
  gene?: string;
  condition_name: string;
  display_condition?: string;
  condition_desc?: string;
  heading1?: string;
  heading_desc1?: string;
  heading_desc2?: string;
  risk_factors?: string;
  symptoms?: string;
  prevention?: string;
  createdAt: string;
}

// Grouped structures
interface GeneGroup {
  gene: string;
  records: GenePageRecord[];
}

interface ConditionGroup {
  condition: string;
  genes: GeneGroup[];
  testId: string;
  testName: string;
  testCode: string;
}

// Group helper
function groupByTestAndCondition(records: GenePageRecord[]): ConditionGroup[] {
  const map = new Map<string, ConditionGroup>();
  for (const rec of records) {
    const key = `${rec.testId}::${rec.condition_name}`;
    if (!map.has(key)) {
      map.set(key, {
        condition: rec.condition_name,
        testId: rec.testId,
        testName: rec.testReportName,
        testCode: rec.testCode,
        genes: [],
      });
    }
    const group = map.get(key)!;
    const geneName = rec.gene || 'unknown';
    let geneGroup = group.genes.find(g => g.gene === geneName);
    if (!geneGroup) {
      geneGroup = { gene: geneName, records: [] };
      group.genes.push(geneGroup);
    }
    geneGroup.records.push(rec);
  }
  return Array.from(map.values()).sort((a, b) => a.condition.localeCompare(b.condition));
}

// ========== Accordion Components ==========
function GeneAccordion({ geneGroup }: { geneGroup: GeneGroup }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-2 last:mb-0">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 w-10">Gene</span>
        <span className="font-mono text-sm font-medium text-gray-700">{geneGroup.gene}</span>
        <span className="ml-auto text-xs text-gray-400">{geneGroup.records.length} record(s)</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="ml-6 pl-4 border-l-2 border-gray-100 mt-1 space-y-3">
          {geneGroup.records.map(rec => (
            <div key={rec._id} className="bg-gray-50 rounded-md p-3 text-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {rec.unique_id && (
                    <p className="font-mono text-xs text-gray-500">ID: {rec.unique_id}</p>
                  )}
                  <p className="font-semibold text-gray-800 mt-1">{rec.condition_name}</p>
                  {rec.display_condition && (
                    <p className="text-xs text-blue-600 mt-0.5">{rec.display_condition}</p>
                  )}
                  {rec.condition_desc && (
                    <p className="text-xs text-gray-600 mt-2">{rec.condition_desc}</p>
                  )}
                </div>
              </div>
              {/* Show new fields if present */}
              {(rec.risk_factors || rec.symptoms || rec.prevention) && (
                <div className="mt-3 space-y-2 text-xs">
                  {rec.risk_factors && (
                    <div>
                      <span className="font-semibold text-gray-700">Risk Factors:</span>
                      <div className="mt-1 text-gray-600" dangerouslySetInnerHTML={{ __html: rec.risk_factors }} />
                    </div>
                  )}
                  {rec.symptoms && (
                    <div>
                      <span className="font-semibold text-gray-700">Symptoms:</span>
                      <div className="mt-1 text-gray-600" dangerouslySetInnerHTML={{ __html: rec.symptoms }} />
                    </div>
                  )}
                  {rec.prevention && (
                    <div>
                      <span className="font-semibold text-gray-700">Prevention:</span>
                      <div className="mt-1 text-gray-600" dangerouslySetInnerHTML={{ __html: rec.prevention }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConditionAccordion({ group, defaultOpen }: { group: ConditionGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const totalRecords = group.genes.reduce((sum, g) => sum + g.records.length, 0);
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1">
          <span className="font-semibold text-gray-900">{group.condition}</span>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
            <span>{group.testName}</span>
            <span>·</span>
            <span className="font-mono">{group.testCode}</span>
            <span>·</span>
            <span>{group.genes.length} gene(s)</span>
            <span>·</span>
            <span>{totalRecords} record(s)</span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 border-t border-gray-100">
          {group.genes.map((geneGroup, idx) => (
            <GeneAccordion key={idx} geneGroup={geneGroup} />
          ))}
        </div>
      )}
    </div>
  );
}

// ========== Main Page Component ==========
export default function GenePageDataPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [records, setRecords] = useState<GenePageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    testId: 'all',
    condition: '',
    gene: '',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTestId, setUploadTestId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTests = useCallback(async () => {
    const res = await fetch('/api/internalwork/tests?isActive=true');
    const data = await res.json();
    setTests(data.data || []);
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '50');
    if (filters.search) params.set('search', filters.search);
    if (filters.testId !== 'all') params.set('testId', filters.testId);
    if (filters.condition) params.set('condition', filters.condition);
    if (filters.gene) params.set('gene', filters.gene);

    try {
      const res = await fetch(`/api/internalwork/gene-page-data?${params}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalRecords(data.pagination.total);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTests(); }, []);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { setPage(1); }, [filters]);

  const grouped = useMemo(() => groupByTestAndCondition(records), [records]);
  const uniqueGenes = useMemo(() => [...new Set(records.map(r => r.gene || 'unknown').filter(Boolean))].sort(), [records]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setPreviewData(Array.isArray(parsed) ? parsed.slice(0, 3) : [parsed]);
    } catch {
      setUploadError('Invalid JSON format');
      setPreviewData([]);
    }
  };

  const handleUpload = async () => {
    if (!uploadTestId || !uploadFile) {
      setUploadError('Please select a test and a file');
      return;
    }
    const test = tests.find(t => t.id === uploadTestId);
    if (!test) {
      setUploadError('Selected test not found');
      return;
    }

    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('testId', test.id);
    fd.append('testCode', test.testCode);
    fd.append('testReportName', test.testName);

    try {
      const res = await fetch('/api/internalwork/gene-page-data', { method: 'POST', body: fd });
      const result = await res.json();
      if (res.ok && result.success) {
        setUploadSuccess(true);
        setMessage({ type: 'success', text: `Uploaded ${result.data.insertedCount} records` });
        setTimeout(() => {
          setUploadSheetOpen(false);
          resetUploadForm();
          fetchRecords();
        }, 1500);
      } else {
        setUploadError(result.error || 'Upload failed');
        if (result.details) console.error('Validation details:', result.details);
      }
    } catch (err) {
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
    const input = document.getElementById('upload-file-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const hasActiveFilters = filters.search !== '' || filters.testId !== 'all' || filters.condition !== '' || filters.gene !== '';

  return (
    <div className="min-h-screen bg-gray-50/60 ">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Gene Page Data</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage condition‑gene page content</p>
          </div>
          <Button onClick={() => setUploadSheetOpen(true)} size="sm" className="gap-1.5">
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-gray-500">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Condition, gene, test name..."
                  value={filters.search}
                  onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div className="w-48">
              <Label className="text-xs text-gray-500">Test</Label>
              <Select value={filters.testId} onValueChange={v => setFilters(p => ({ ...p, testId: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Tests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests</SelectItem>
                  {tests.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.testName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label className="text-xs text-gray-500">Condition</Label>
              <Input
                placeholder="Condition name"
                value={filters.condition}
                onChange={e => setFilters(p => ({ ...p, condition: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="w-48">
              <Label className="text-xs text-gray-500">Gene</Label>
              <Select value={filters.gene} onValueChange={v => setFilters(p => ({ ...p, gene: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Genes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genes</SelectItem>
                  {uniqueGenes.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ search: '', testId: 'all', condition: '', gene: '' })}
                className="h-9 px-3"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-gray-400">
            {loading ? 'Loading...' : `${totalRecords} record(s) · ${grouped.length} condition(s)`}
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">
            <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No data found. Upload a JSON file to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((group, idx) => (
              <ConditionAccordion key={idx} group={group} defaultOpen={idx === 0} />
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Sheet */}
      <Sheet open={uploadSheetOpen} onOpenChange={open => { if (!open) resetUploadForm(); setUploadSheetOpen(open); }}>
        <SheetContent className="w-[500px] sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Upload Gene Page Data</SheetTitle>
            <SheetDescription>
              Upload a JSON array of records. Each record will be linked to the selected test.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-5 mt-6">
            <div>
              <Label>Test *</Label>
              <Select value={uploadTestId} onValueChange={setUploadTestId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a test" />
                </SelectTrigger>
                <SelectContent>
                  {tests.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.testName} ({t.testCode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>JSON File *</Label>
              <label htmlFor="upload-file-input" className="mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50">
                <FileJson className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">{uploadFile ? uploadFile.name : 'Click to choose file'}</span>
                <input id="upload-file-input" type="file" accept=".json" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            {previewData.length > 0 && (
              <div>
                <Label className="text-xs">Preview (first 3 records)</Label>
                <ScrollArea className="h-40 border rounded-md bg-gray-50 p-2 mt-1">
                  <pre className="text-xs font-mono">{JSON.stringify(previewData, null, 2)}</pre>
                </ScrollArea>
              </div>
            )}
            {uploadError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            {uploadSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Upload successful!</AlertDescription>
              </Alert>
            )}
          </div>
          <SheetFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setUploadSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!uploadFile || !uploadTestId || uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Toast */}
      {message && (
        <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm text-white ${
          message.type === 'success' ? 'bg-gray-800' : 'bg-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}