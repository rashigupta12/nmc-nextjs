/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import * as XLSX from "xlsx";

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
  const [allTests, setAllTests] = useState<Test[]>([]); // For parent/subparent dropdowns
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
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

  // Fetch tests (only active by default)
  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/test-catalog?page=${page}&limit=20&search=${search}&isActive=true`
      );
      const data = await res.json();
      setTests(data.tests);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching tests:", error);
      Swal.fire("Error", "Failed to load tests", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all tests (including inactive) for parent/subparent dropdowns
  const fetchAllTests = async () => {
    try {
      const res = await fetch(`/api/admin/test-catalog?limit=1000`);
      const data = await res.json();
      setAllTests(data.tests);
    } catch (error) {
      console.error("Error fetching all tests for dropdown:", error);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchAllTests();
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
        setShowCreateSheet(false);
        resetForm();
        fetchTests();
        fetchAllTests(); // refresh dropdown list
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
        setShowEditSheet(false);
        resetForm();
        fetchTests();
        fetchAllTests();
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
          fetchAllTests();
        } else {
          throw new Error("Failed to delete");
        }
      } catch (error) {
        console.error("Error deleting test:", error);
        Swal.fire("Error", "Failed to delete test", "error");
      }
    }
  };

  // Bulk upload (unchanged)
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
          fetchAllTests();
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

  // Download template (unchanged)
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

  const openEditSheet = (test: Test) => {
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
    setShowEditSheet(true);
  };

  // Helper to get test name from ID
  const getTestNameById = (id: string | null) => {
    if (!id) return "None";
    const test = allTests.find(t => t.id === id);
    return test ? `${test.testName} (${test.testCode})` : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
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
                  setShowCreateSheet(true);
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
                                  onClick={() => openEditSheet(test)}
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

      {/* Create Sheet - Right Side Drawer */}
      <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
        <SheetContent className="w-[600px] sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Test</SheetTitle>
            <SheetDescription>
              Enter the test details to add it to the catalog
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
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
                <Label>Parent Test</Label>
                <Select
                  value={formData.parentTestId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentTestId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {allTests
                      .filter(t => t.id !== selectedTest?.id) // Avoid self-reference in edit mode
                      .map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.testName} ({test.testCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sub Parent Of</Label>
                <Select
                  value={formData.subParentOf || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subParentOf: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-parent test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {allTests
                      .filter(t => t.id !== selectedTest?.id)
                      .map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.testName} ({test.testCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
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
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowCreateSheet(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-blue-600">
              Create Test
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet - Right Side Drawer */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent className="w-[600px] sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Test</SheetTitle>
            <SheetDescription>
              Update the test details
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
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
                <Label>Parent Test</Label>
                <Select
                  value={formData.parentTestId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentTestId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {allTests
                      .filter(t => t.id !== selectedTest?.id)
                      .map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.testName} ({test.testCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedTest?.parentTestId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {getTestNameById(selectedTest.parentTestId)}
                  </p>
                )}
              </div>
              <div>
                <Label>Sub Parent Of</Label>
                <Select
                  value={formData.subParentOf || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subParentOf: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-parent test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {allTests
                      .filter(t => t.id !== selectedTest?.id)
                      .map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.testName} ({test.testCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedTest?.subParentOf && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {getTestNameById(selectedTest.subParentOf)}
                  </p>
                )}
              </div>
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
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowEditSheet(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-blue-600">
              Update Test
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bulk Upload Dialog (unchanged) */}
      {/* ... keep the same bulk dialog ... */}
    </div>
  );
}