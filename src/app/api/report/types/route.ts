// ============================================================
// GET /api/report/types
//
// Returns the list of registered report types.
// Used by the frontend generic page to display the report label
// and populate any type selector dropdowns.
// ============================================================

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { listReportTypes } from '@/lib/reportEngine';

export async function GET() {
  return NextResponse.json(listReportTypes());
}
