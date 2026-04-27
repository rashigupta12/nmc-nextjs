/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface VendorEthnicity {
  id: string;
  ethnicity: string;
  createdAt: string;
  updatedAt: string;
}

export default function VendorEthnicityPage() {
  const [ethnicities, setEthnicities] = useState<VendorEthnicity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEthnicity, setEditingEthnicity] = useState<VendorEthnicity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ethnicityToDelete, setEthnicityToDelete] = useState<VendorEthnicity | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    ethnicity: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch ethnicities
  const fetchEthnicities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '20');
    if (search) params.set('search', search);

    try {
      const res = await fetch(`/api/internalwork/vendor-ethnicities?${params}`);
      const data = await res.json();
      if (data.success) {
        setEthnicities(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalRecords(data.pagination.total);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load ethnicities' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchEthnicities();
  }, [fetchEthnicities]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const resetForm = () => {
    setFormData({
      ethnicity: '',
    });
    setEditingEthnicity(null);
    setFormError(null);
  };

  const handleEdit = (ethnicity: VendorEthnicity) => {
    setEditingEthnicity(ethnicity);
    setFormData({
      ethnicity: ethnicity.ethnicity,
    });
    setSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!ethnicityToDelete) return;

    try {
      const res = await fetch(`/api/internalwork/vendor-ethnicities/${ethnicityToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Ethnicity deleted successfully' });
        fetchEthnicities();
      } else {
        setMessage({ type: 'error', text: data.error || 'Delete failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setDeleteDialogOpen(false);
      setEthnicityToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const url = editingEthnicity
        ? `/api/internalwork/vendor-ethnicities/${editingEthnicity.id}`
        : '/api/internalwork/vendor-ethnicities';
      const method = editingEthnicity ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: editingEthnicity ? 'Ethnicity updated successfully' : 'Ethnicity created successfully',
        });
        setSheetOpen(false);
        resetForm();
        fetchEthnicities();
      } else {
        setFormError(data.error || 'Operation failed');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  const hasFilters = search !== '';

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Ethnicity Master</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage ethnicity options
            </p>
          </div>
          <Button onClick={() => {
            resetForm();
            setSheetOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Ethnicity
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
                  placeholder="Search ethnicity..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearch('')}
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
            {loading ? 'Loading...' : `${totalRecords} ethnicity(ies)`}
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : ethnicities.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No ethnicities found. Add your first ethnicity to get started.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Ethnicity</TableHead>
                    <TableHead className="font-semibold">Created At</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ethnicities.map((ethnicity) => (
                    <TableRow key={ethnicity.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{ethnicity.ethnicity}</TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDate(ethnicity.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(ethnicity)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEthnicityToDelete(ethnicity);
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
        <SheetContent className="w-[500px] sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingEthnicity ? 'Edit Ethnicity' : 'Add New Ethnicity'}</SheetTitle>
            <SheetDescription>
              {editingEthnicity
                ? 'Update the ethnicity information below.'
                : 'Fill in the details to add a new ethnicity option.'}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div>
              <Label htmlFor="ethnicity">Ethnicity Name *</Label>
              <Input
                id="ethnicity"
                value={formData.ethnicity}
                onChange={e => setFormData(prev => ({ ...prev, ethnicity: e.target.value }))}
                placeholder="e.g., Asian, Caucasian, African American, Hispanic"
                required
                className="mt-1"
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
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingEthnicity ? 'Update' : 'Create'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ethnicity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{ethnicityToDelete?.ethnicity}"? This action cannot be undone.
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