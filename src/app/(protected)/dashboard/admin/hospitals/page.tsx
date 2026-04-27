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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Hospital,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface VendorHospital {
  id: string;
  hospital: string;
  address: string;
  contactNo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function VendorHospitalPage() {
  const [hospitals, setHospitals] = useState<VendorHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<VendorHospital | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<VendorHospital | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    hospital: '',
    address: '',
    contactNo: '',
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch hospitals
  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '20');
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('isActive', statusFilter === 'active' ? 'true' : 'false');

    try {
      const res = await fetch(`/api/internalwork/vendor-hospitals?${params}`);
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalRecords(data.pagination.total);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load hospitals' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const resetForm = () => {
    setFormData({
      hospital: '',
      address: '',
      contactNo: '',
      isActive: true,
    });
    setEditingHospital(null);
    setFormError(null);
  };

  const handleEdit = (hospital: VendorHospital) => {
    setEditingHospital(hospital);
    setFormData({
      hospital: hospital.hospital,
      address: hospital.address,
      contactNo: hospital.contactNo,
      isActive: hospital.isActive,
    });
    setSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!hospitalToDelete) return;

    try {
      const res = await fetch(`/api/internalwork/vendor-hospitals/${hospitalToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Hospital deleted successfully' });
        fetchHospitals();
      } else {
        setMessage({ type: 'error', text: data.error || 'Delete failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setDeleteDialogOpen(false);
      setHospitalToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const url = editingHospital
        ? `/api/internalwork/vendor-hospitals/${editingHospital.id}`
        : '/api/internalwork/vendor-hospitals';
      const method = editingHospital ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: editingHospital ? 'Hospital updated successfully' : 'Hospital created successfully',
        });
        setSheetOpen(false);
        resetForm();
        fetchHospitals();
      } else {
        setFormError(data.error || 'Operation failed');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setFormLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50/60 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Hospital Master</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage hospital locations
            </p>
          </div>
          <Button onClick={() => {
            resetForm();
            setSheetOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Hospital
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
                  placeholder="Hospital name, address..."
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
            {loading ? 'Loading...' : `${totalRecords} hospital(s)`}
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">
            <Hospital className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hospitals found. Add your first hospital to get started.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Hospital Name</TableHead>
                    <TableHead className="font-semibold">Contact No</TableHead>
                    <TableHead className="font-semibold">Address</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitals.map((hospital) => (
                    <TableRow key={hospital.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{hospital.hospital}</TableCell>
                      <TableCell>{hospital.contactNo}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={hospital.address}>
                          {hospital.address}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(hospital.isActive)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(hospital)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setHospitalToDelete(hospital);
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
            <SheetTitle>{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</SheetTitle>
            <SheetDescription>
              {editingHospital
                ? 'Update the hospital information below.'
                : 'Fill in the details to add a new hospital location.'}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div>
              <Label htmlFor="hospital">Hospital Name *</Label>
              <Input
                id="hospital"
                value={formData.hospital}
                onChange={e => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                placeholder="e.g., City General Hospital"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contactNo">Contact Number *</Label>
              <Input
                id="contactNo"
                value={formData.contactNo}
                onChange={e => setFormData(prev => ({ ...prev, contactNo: e.target.value }))}
                placeholder="e.g., +91 1234567890"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address with city, state, and zip code"
                required
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                onValueChange={v => setFormData(prev => ({ ...prev, isActive: v === 'active' }))}
              >
                <SelectTrigger id="isActive" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
                {editingHospital ? 'Update' : 'Create'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{hospitalToDelete?.hospital}"? This action cannot be undone.
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