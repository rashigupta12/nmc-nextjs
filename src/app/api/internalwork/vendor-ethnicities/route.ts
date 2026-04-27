// app/api/internalwork/vendor-ethnicities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorEthnicities,
  createVendorEthnicity,
  getVendorEthnicityOptions,
} from '@/lib/vendor-ethnicity-operations';
// import { verifyAuth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // const auth = await verifyAuth(request);
    // if (!auth) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const options = searchParams.get('options') === 'true';

    if (options) {
      const data = await getVendorEthnicityOptions();
      return NextResponse.json({ success: true, data });
    }

    const result = await getVendorEthnicities({
      search,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('GET /vendor-ethnicities error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ethnicities' },
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
    const { ethnicity } = body;

    if (!ethnicity) {
      return NextResponse.json(
        { success: false, error: 'Ethnicity is required' },
        { status: 400 }
      );
    }

    const ethnicityData = await createVendorEthnicity({
      ethnicity,
    });

    return NextResponse.json({ success: true, data: ethnicityData });
  } catch (error) {
    console.error('POST /vendor-ethnicities error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ethnicity' },
      { status: 500 }
    );
  }
}