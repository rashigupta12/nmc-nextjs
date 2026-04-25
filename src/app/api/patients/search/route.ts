// app/patients/search/route.ts
import { db } from '@/db';
import { PatientsTable } from '@/db/schema';
import { ilike, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    
    if (!query.trim() || query.length < 2) {
      return NextResponse.json({
        success: true,
        patients: []
      });
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    
    const patients = await db.select({
      id: PatientsTable.id,
      patientId: PatientsTable.patientId,
      patientFName: PatientsTable.patientFName,
      patientLName: PatientsTable.patientLName,
      age: PatientsTable.age,
      gender: PatientsTable.gender,
      email: PatientsTable.email,
      mobileNo: PatientsTable.mobileNo,
      mrno: PatientsTable.mrno,
    })
    .from(PatientsTable)
    .where(
      or(
        ilike(PatientsTable.patientId, searchTerm),
        ilike(PatientsTable.patientFName, searchTerm),
        ilike(PatientsTable.patientLName, searchTerm),
        ilike(PatientsTable.email, searchTerm),
        ilike(PatientsTable.mobileNo, searchTerm),
        ilike(PatientsTable.mrno, searchTerm)
      )
    )
    .limit(20);

    return NextResponse.json({
      success: true,
      patients: patients
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search patients' },
      { status: 500 }
    );
  }
}