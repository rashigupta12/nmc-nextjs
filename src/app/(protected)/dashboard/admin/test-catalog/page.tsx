"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentUser } from "@/hooks/auth";
import {
  Download,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';

interface Test {
  id: string;
  testCode: string;
  testName: string;
  alias: string | null;
  description: string | null;
  parentTestId: string | null;
  subParentOf: string | null;
  tatDays: number;
  price: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Extended test interface for display
interface TestWithParentNames extends Test {
  parentTestName?: string;
  subParentName?: string;
}

export default function TestCatalogPage() {
  const user = useCurrentUser();
  const [tests, setTests] = useState<TestWithParentNames[]>([]);
  const [allTests, setAllTests] = useState<Test[]>([]); // Store all tests for parent lookup
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [showBulkSheet, setShowBulkSheet] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    testCode: "",
    testName: "",
    alias: "",
    description: "",
    parentTestId: "",
    parentTestName: "",
    subParentOf: "",
    subParentName: "",
    tatDays: "",
    price: "",
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Parent test options for dropdown
  const [parentOptions, setParentOptions] = useState<{ id: string; name: string; code: string }[]>([]);

  // Fetch all tests for parent lookup
  const fetchAllTests = async () => {
    try {
      const res = await fetch(`/api/admin/test-catalog?limit=1000`);
      if (res.ok) {
        const data = await res.json();
        setAllTests(data.tests || []);
        
        // Build parent options (only tests that can be parents)
        const options = (data.tests || [])
          .filter((test: Test) => test.isActive)
          .map((test: Test) => ({
            id: test.id,
            name: test.testName,
            code: test.testCode,
          }));
        setParentOptions(options);
      }
    } catch (error) {
      console.error("Error fetching all tests:", error);
    }
  };

  // Fetch tests with pagination
  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('isActive', statusFilter === 'active' ? 'true' : 'false');

      const res = await fetch(`/api/admin/test-catalog?${params}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      
      // Enrich tests with parent names
      const enrichedTests = (data.tests || []).map((test: Test) => ({
        ...test,
        parentTestName: getParentTestName(test.parentTestId),
        subParentName: getParentTestName(test.subParentOf),
      }));
      
      setTests(enrichedTests);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalRecords(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching tests:", error);
      setMessage({ type: 'error', text: "Failed to load tests" });
      setTests([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get parent test name by ID
  const getParentTestName = (parentId: string | null): string | undefined => {
    if (!parentId) return undefined;
    const parent = allTests.find(t => t.id === parentId);
    return parent ? `${parent.testName} (${parent.testCode})` : undefined;
  };

  // Helper: Get parent test by ID
  const getParentTestById = (parentId: string | null): Test | undefined => {
    if (!parentId) return undefined;
    return allTests.find(t => t.id === parentId);
  };

  useEffect(() => {
    fetchAllTests();
  }, []);

  useEffect(() => {
    fetchTests();
  }, [page, search, statusFilter, allTests]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const resetForm = () => {
    setFormData({
      testCode: "",
      testName: "",
      alias: "",
      description: "",
      parentTestId: "",
      parentTestName: "",
      subParentOf: "",
      subParentName: "",
      tatDays: "",
      price: "",
      isActive: true,
    });
    setEditingTest(null);
    setFormError(null);
  };

  // Handle parent selection
  const handleParentSelect = (value: string, field: 'parentTestId' | 'subParentOf') => {
    const selectedParent = parentOptions.find(opt => opt.id === value);
    if (selectedParent) {
      setFormData(prev => ({
        ...prev,
        [field]: selectedParent.id,
        [`${field === 'parentTestId' ? 'parentTestName' : 'subParentName'}`]: selectedParent.name,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: "",
        [`${field === 'parentTestId' ? 'parentTestName' : 'subParentName'}`]: "",
      }));
    }
  };

  // Create test
  const handleCreate = async () => {
    if (!formData.testCode || !formData.testName || !formData.tatDays) {
      setFormError("Please fill all required fields");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/test-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testCode: formData.testCode,
          testName: formData.testName,
          alias: formData.alias || null,
          description: formData.description || null,
          parentTestId: formData.parentTestId || null,
          subParentOf: formData.subParentOf || null,
          tatDays: parseInt(formData.tatDays),
          price: formData.price ? parseFloat(formData.price) : null,
          isActive: formData.isActive,
          createdBy: user?.id,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Test created successfully" });
        setSheetOpen(false);
        resetForm();
        await fetchAllTests();
        await fetchTests();
      } else {
        const error = await res.json();
        setFormError(error.error || "Failed to create test");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      setFormError("An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  // Update test
  const handleUpdate = async () => {
    if (!editingTest) return;

    setFormLoading(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/admin/test-catalog/${editingTest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testCode: formData.testCode,
          testName: formData.testName,
          alias: formData.alias || null,
          description: formData.description || null,
          parentTestId: formData.parentTestId || null,
          subParentOf: formData.subParentOf || null,
          tatDays: parseInt(formData.tatDays),
          price: formData.price ? parseFloat(formData.price) : null,
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Test updated successfully" });
        setSheetOpen(false);
        resetForm();
        await fetchAllTests();
        await fetchTests();
      } else {
        const error = await res.json();
        setFormError(error.error || "Failed to update test");
      }
    } catch (error) {
      console.error("Error updating test:", error);
      setFormError("An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete test
  const handleDelete = async () => {
    if (!testToDelete) return;

    try {
      const res = await fetch(`/api/admin/test-catalog/${testToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Test deleted successfully" });
        await fetchAllTests();
        await fetchTests();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      setMessage({ type: 'error', text: "Failed to delete test" });
    } finally {
      setDeleteDialogOpen(false);
      setTestToDelete(null);
    }
  };

  // Bulk upload
  const handleBulkUpload = async () => {
    if (!excelFile) {
      setFormError("Please select an Excel file");
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", excelFile);
    formDataUpload.append("createdBy", user?.id || "");

    try {
      const res = await fetch("/api/admin/test-catalog", {
        method: "PUT",
        body: formDataUpload,
      });

      const result = await res.json();

      if (res.ok) {
        let messageText = `Bulk upload completed!\n\n✅ Success: ${result.summary.success}\n`;
        if (result.summary.duplicates > 0) {
          messageText += `⚠️ Duplicates: ${result.summary.duplicates}\n`;
        }
        if (result.summary.errors > 0) {
          messageText += `❌ Errors: ${result.summary.errors}`;
        }

        Swal.fire({
          title: "Upload Complete",
          text: messageText,
          icon: result.summary.errors > 0 ? "warning" : "success",
        });

        if (result.summary.success > 0) {
          await fetchAllTests();
          await fetchTests();
        }
        setShowBulkSheet(false);
        setExcelFile(null);
      } else {
        Swal.fire("Error", result.error || "Failed to upload", "error");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      Swal.fire("Error", "Failed to upload file", "error");
    } finally {
      setUploading(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      {
        testCode: "TEST001",
        testName: "Complete Blood Count",
        alias: "CBC",
        description: "Measures red and white blood cells",
        parentTestId: "",
        subParentOf: "",
        tatDays: 2,
        price: 500,
        isActive: true,
      },
      {
        testCode: "TEST002",
        testName: "Lipid Profile",
        alias: "Lipid Panel",
        description: "Measures cholesterol levels",
        parentTestId: "",
        subParentOf: "",
        tatDays: 3,
        price: 800,
        isActive: true,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tests");
    XLSX.writeFile(workbook, "test_catalog_template.xlsx");
  };

  const openEditDialog = (test: TestWithParentNames) => {
    setEditingTest(test);
    setFormData({
      testCode: test.testCode,
      testName: test.testName,
      alias: test.alias || "",
      description: test.description || "",
      parentTestId: test.parentTestId || "",
      parentTestName: test.parentTestName || "",
      subParentOf: test.subParentOf || "",
      subParentName: test.subParentName || "",
      tatDays: test.tatDays.toString(),
      price: test.price || "",
      isActive: test.isActive,
    });
    setSheetOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Inactive
      </Badge>
    );
  };

  const hasFilters = search !== '' || statusFilter !== 'all';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTest) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Test Catalog</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage all available medical tests and their parameters
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowBulkSheet(true)}
              variant="outline"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setSheetOpen(true);
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Add Test
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-gray-500">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Test name, code, or alias..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div className="w-40">
              <Label className="text-xs text-gray-500">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
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
            {loading ? 'Loading...' : `${totalRecords} test(s)`}
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">
            <FlaskConical className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tests found. Add your first test to get started.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Test Code</TableHead>
                    <TableHead className="font-semibold">Test Name</TableHead>
                    <TableHead className="font-semibold">Alias</TableHead>
                    <TableHead className="font-semibold">Parent Test</TableHead>
                    <TableHead className="font-semibold">Sub Parent</TableHead>
                    
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{test.testCode}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{test.testName}</div>
                          {test.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {test.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{test.alias || "-"}</TableCell>
                      <TableCell>
                        {test.parentTestName ? (
                          <span className="text-sm">{test.parentTestName}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {test.subParentName ? (
                          <span className="text-sm">{test.subParentName}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      
                  
                      <TableCell>{getStatusBadge(test.isActive)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(test)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTestToDelete(test);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={open => {
        if (!open) resetForm();
        setSheetOpen(open);
      }}>
        <SheetContent className="w-[600px] sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingTest ? 'Edit Test' : 'Add New Test'}</SheetTitle>
            <SheetDescription>
              {editingTest
                ? 'Update the test details below.'
                : 'Fill in the details to add a new test to the catalog.'}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testCode">Test Code *</Label>
                <Input
                  id="testCode"
                  value={formData.testCode}
                  onChange={e => setFormData(prev => ({ ...prev, testCode: e.target.value }))}
                  placeholder="e.g., CBC001"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="testName">Test Name *</Label>
                <Input
                  id="testName"
                  value={formData.testName}
                  onChange={e => setFormData(prev => ({ ...prev, testName: e.target.value }))}
                  placeholder="e.g., Complete Blood Count"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                value={formData.alias}
                onChange={e => setFormData(prev => ({ ...prev, alias: e.target.value }))}
                placeholder="e.g., CBC"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Test description..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tatDays">TAT (Days) *</Label>
                <Input
                  id="tatDays"
                  type="number"
                  value={formData.tatDays}
                  onChange={e => setFormData(prev => ({ ...prev, tatDays: e.target.value }))}
                  placeholder="2"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="500"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="parentTestId">Parent Test</Label>
              <Select
                value={formData.parentTestId || "none"}
                onValueChange={(value) => handleParentSelect(value === "none" ? "" : value, 'parentTestId')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select parent test">
                    {formData.parentTestName || "None"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root Test)</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name} ({option.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.parentTestId && `Selected: ${formData.parentTestName}`}
              </p>
            </div>

            <div>
              <Label htmlFor="subParentOf">Sub Parent Of</Label>
              <Select
                value={formData.subParentOf || "none"}
                onValueChange={(value) => handleParentSelect(value === "none" ? "" : value, 'subParentOf')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select sub-parent test">
                    {formData.subParentName || "None"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name} ({option.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.subParentOf && `Selected: ${formData.subParentName}`}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            {formError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <SheetFooter className="mt-6 gap-2">
              <Button variant="outline" type="button" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-700">
                {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingTest ? 'Update' : 'Create'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Bulk Upload Sheet */}
      <Sheet open={showBulkSheet} onOpenChange={setShowBulkSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Bulk Upload Tests</SheetTitle>
            <SheetDescription>
              Upload an Excel file with multiple tests at once
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Click to select or drag and drop your Excel file
              </p>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {excelFile && (
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {excelFile.name}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
          <SheetFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setShowBulkSheet(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpload} disabled={uploading} className="bg-blue-600 hover:bg-blue-700">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{testToDelete?.testName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast Message */}
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