// app/api/internalwork/vendor-ethnicities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorEthnicityById,
  updateVendorEthnicity,
  deleteVendorEthnicity,
} from '@/lib/vendor-ethnicity-operations';
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

    const ethnicity = await getVendorEthnicityById(params.id);
    if (!ethnicity) {
      return NextResponse.json(
        { success: false, error: 'Ethnicity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ethnicity });
  } catch (error) {
    console.error('GET /vendor-ethnicities/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ethnicity' },
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
    const { ethnicity } = body;

    const updated = await updateVendorEthnicity(params.id, {
      ethnicity,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Ethnicity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /vendor-ethnicities/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ethnicity' },
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

    const deleted = await deleteVendorEthnicity(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Ethnicity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Ethnicity deleted successfully' });
  } catch (error) {
    console.error('DELETE /vendor-ethnicities/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete ethnicity' },
      { status: 500 }
    );
  }
}