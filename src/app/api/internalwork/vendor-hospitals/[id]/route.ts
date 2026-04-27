import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorHospitalById,
  updateVendorHospital,
  deleteVendorHospital,
} from '@/lib/vendor-hospital-operations';
// import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const auth = await verifyAuth(request);
    // if (!auth) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const hospital = await getVendorHospitalById(params.id);
    if (!hospital) {
      return NextResponse.json(
        { success: false, error: 'Hospital not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: hospital });
  } catch (error) {
    console.error('GET /vendor-hospitals/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hospital' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const auth = await verifyAuth(request);
    // if (!auth || auth.role !== 'SUPER_ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { hospital, address, contactNo, isActive } = body;

    const updated = await updateVendorHospital(params.id, {
      hospital,
      address,
      contactNo,
      isActive,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Hospital not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /vendor-hospitals/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hospital' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const auth = await verifyAuth(request);
    // if (!auth || auth.role !== 'SUPER_ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const deleted = await deleteVendorHospital(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Hospital not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Hospital deleted successfully' });
  } catch (error) {
    console.error('DELETE /vendor-hospitals/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hospital' },
      { status: 500 }
    );
  }
}