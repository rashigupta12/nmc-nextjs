
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useCurrentUser } from "@/hooks/auth";
import {
  Download,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
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

export default function TestCatalogPage() {
  const user = useCurrentUser();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [uploading, setUploading] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    testCode: "",
    testName: "",
    alias: "",
    description: "",
    parentTestId: "",
    subParentOf: "",
    tatDays: "",
    price: "",
    isActive: true,
  });

  // Fetch tests
 const fetchTests = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `/api/admin/test-catalog?page=${page}&limit=20&search=${search}`
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    setTests(data.tests || []);                       // fallback to empty array
    setTotalPages(data.pagination?.totalPages || 1);  // optional chaining + fallback
  } catch (error) {
    console.error("Error fetching tests:", error);
    Swal.fire("Error", "Failed to load tests", "error");
    setTests([]);                                     // ensure array on error
    setTotalPages(1);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTests();
  }, [page, search]);

  // Create test
  const handleCreate = async () => {
    if (!formData.testCode || !formData.testName || !formData.tatDays) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/test-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tatDays: parseInt(formData.tatDays),
          price: formData.price ? parseFloat(formData.price) : null,
          createdBy: user?.id,
        }),
      });

      if (res.ok) {
        Swal.fire("Success", "Test created successfully", "success");
        setShowCreateDialog(false);
        resetForm();
        fetchTests();
      } else {
        const error = await res.json();
        Swal.fire("Error", error.error || "Failed to create test", "error");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  };

  // Update test
  const handleUpdate = async () => {
    if (!selectedTest) return;

    try {
      const res = await fetch(`/api/admin/test-catalog/${selectedTest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tatDays: parseInt(formData.tatDays),
          price: formData.price ? parseFloat(formData.price) : null,
        }),
      });

      if (res.ok) {
        Swal.fire("Success", "Test updated successfully", "success");
        setShowEditDialog(false);
        resetForm();
        fetchTests();
      } else {
        const error = await res.json();
        Swal.fire("Error", error.error || "Failed to update test", "error");
      }
    } catch (error) {
      console.error("Error updating test:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  };

  // Delete test
  const handleDelete = async (test: Test) => {
    const result = await Swal.fire({
      title: "Delete Test",
      text: `Are you sure you want to delete "${test.testName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/test-catalog/${test.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("Deleted!", "Test has been deleted.", "success");
          fetchTests();
        } else {
          throw new Error("Failed to delete");
        }
      } catch (error) {
        console.error("Error deleting test:", error);
        Swal.fire("Error", "Failed to delete test", "error");
      }
    }
  };

  // Bulk upload
  const handleBulkUpload = async () => {
    if (!excelFile) {
      Swal.fire("Error", "Please select an Excel file", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("createdBy", user?.id || "");

    try {
      const res = await fetch("/api/admin/test-catalog", {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        let message = `Bulk upload completed!\n\n✅ Success: ${result.summary.success}\n`;
        if (result.summary.duplicates > 0) {
          message += `⚠️ Duplicates: ${result.summary.duplicates}\n`;
        }
        if (result.summary.errors > 0) {
          message += `❌ Errors: ${result.summary.errors}`;
        }

        Swal.fire({
          title: "Upload Complete",
          text: message,
          icon: result.summary.errors > 0 ? "warning" : "success",
        });

        if (result.summary.success > 0) {
          fetchTests();
        }
        setShowBulkDialog(false);
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

  const resetForm = () => {
    setFormData({
      testCode: "",
      testName: "",
      alias: "",
      description: "",
      parentTestId: "",
      subParentOf: "",
      tatDays: "",
      price: "",
      isActive: true,
    });
    setSelectedTest(null);
  };

  const openEditDialog = (test: Test) => {
    setSelectedTest(test);
    setFormData({
      testCode: test.testCode,
      testName: test.testName,
      alias: test.alias || "",
      description: test.description || "",
      parentTestId: test.parentTestId || "",
      subParentOf: test.subParentOf || "",
      tatDays: test.tatDays.toString(),
      price: test.price || "",
      isActive: test.isActive,
    });
    setShowEditDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white  w-full">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Test Catalog
              </h1>
              <p className="text-gray-600">
                Manage all available medical tests and their parameters
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowBulkDialog(true)}
                variant="outline"
                className="border-gray-300"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setShowCreateDialog(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by test name, code, or alias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tests Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Code</TableHead>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Alias</TableHead>
                        <TableHead>TAT (Days)</TableHead>
                        <TableHead>Price (₹)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No tests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        tests.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell className="font-medium">
                              {test.testCode}
                            </TableCell>
                            <TableCell>{test.testName}</TableCell>
                            <TableCell>{test.alias || "-"}</TableCell>
                            <TableCell>{test.tatDays}</TableCell>
                            <TableCell>
                              {test.price ? `₹${test.price}` : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  test.isActive ? "default" : "secondary"
                                }
                                className={
                                  test.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {test.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(test)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(test)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center p-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
            <DialogDescription>
              Enter the test details to add it to the catalog
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Test Code *</Label>
                <Input
                  value={formData.testCode}
                  onChange={(e) =>
                    setFormData({ ...formData, testCode: e.target.value })
                  }
                  placeholder="CBC001"
                />
              </div>
              <div>
                <Label>Test Name *</Label>
                <Input
                  value={formData.testName}
                  onChange={(e) =>
                    setFormData({ ...formData, testName: e.target.value })
                  }
                  placeholder="Complete Blood Count"
                />
              </div>
            </div>
            <div>
              <Label>Alias</Label>
              <Input
                value={formData.alias}
                onChange={(e) =>
                  setFormData({ ...formData, alias: e.target.value })
                }
                placeholder="CBC"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Test description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>TAT (Days) *</Label>
                <Input
                  type="number"
                  value={formData.tatDays}
                  onChange={(e) =>
                    setFormData({ ...formData, tatDays: e.target.value })
                  }
                  placeholder="2"
                />
              </div>
              <div>
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="500"
                />
              </div>
            </div>
            <div>
              <Label>Parent Test ID</Label>
              <Input
                value={formData.parentTestId}
                onChange={(e) =>
                  setFormData({ ...formData, parentTestId: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Sub Parent Of</Label>
              <Input
                value={formData.subParentOf}
                onChange={(e) =>
                  setFormData({ ...formData, subParentOf: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-blue-600">
              Create Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test</DialogTitle>
            <DialogDescription>
              Update the test details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Test Code *</Label>
                <Input
                  value={formData.testCode}
                  onChange={(e) =>
                    setFormData({ ...formData, testCode: e.target.value })
                  }
                  placeholder="CBC001"
                />
              </div>
              <div>
                <Label>Test Name *</Label>
                <Input
                  value={formData.testName}
                  onChange={(e) =>
                    setFormData({ ...formData, testName: e.target.value })
                  }
                  placeholder="Complete Blood Count"
                />
              </div>
            </div>
            <div>
              <Label>Alias</Label>
              <Input
                value={formData.alias}
                onChange={(e) =>
                  setFormData({ ...formData, alias: e.target.value })
                }
                placeholder="CBC"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Test description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>TAT (Days) *</Label>
                <Input
                  type="number"
                  value={formData.tatDays}
                  onChange={(e) =>
                    setFormData({ ...formData, tatDays: e.target.value })
                  }
                  placeholder="2"
                />
              </div>
              <div>
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="500"
                />
              </div>
            </div>
            <div>
              <Label>Parent Test ID</Label>
              <Input
                value={formData.parentTestId}
                onChange={(e) =>
                  setFormData({ ...formData, parentTestId: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Sub Parent Of</Label>
              <Input
                value={formData.subParentOf}
                onChange={(e) =>
                  setFormData({ ...formData, subParentOf: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-blue-600">
              Update Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Tests</DialogTitle>
            <DialogDescription>
              Upload an Excel file with multiple tests at once
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}