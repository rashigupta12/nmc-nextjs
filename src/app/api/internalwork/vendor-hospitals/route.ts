import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorHospitals,
  createVendorHospital,
} from '@/lib/vendor-hospital-operations';
// import { verifyAuth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // const auth = await verifyAuth(request);
    // if (!auth) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await getVendorHospitals({
      search,
      isActive: isActive ? isActive === 'true' : undefined,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('GET /vendor-hospitals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hospitals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // const auth = await verifyAuth(request);
    // if (!auth || auth.role !== 'SUPER_ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { hospital, address, contactNo, isActive } = body;

    if (!hospital || !address || !contactNo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const hospitalData = await createVendorHospital({
      hospital,
      address,
      contactNo,
      isActive,
    });

    return NextResponse.json({ success: true, data: hospitalData });
  } catch (error) {
    console.error('POST /vendor-hospitals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hospital' },
      { status: 500 }
    );
  }
}