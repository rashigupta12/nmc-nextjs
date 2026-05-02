export const runtime = "nodejs";

import { db } from "@/db";
import { PatientsTable, VendorsTable, UsersTable } from "@/db/schema";
import { eq, ilike, and, or, desc, asc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET - List all patients with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const offset = (page - 1) * limit;

    const search = searchParams.get("search") ?? "";
    const vendorId = searchParams.get("vendorId");
    const gender = searchParams.get("gender");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") ?? "desc";

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(PatientsTable.patientFName, `%${search}%`),
          ilike(PatientsTable.patientLName, `%${search}%`),
          ilike(PatientsTable.email, `%${search}%`),
          ilike(PatientsTable.patientId, `%${search}%`),
          ilike(PatientsTable.mrno, `%${search}%`)
        )
      );
    }

    if (vendorId) {
      conditions.push(eq(PatientsTable.vendorId, vendorId));
    }

    if (gender) {
      conditions.push(eq(PatientsTable.gender, gender as "M" | "F" | "Other"));
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(PatientsTable.isActive, isActive === "true"));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Sorting
    const orderColumn =
      sortBy === "patientFName"
        ? PatientsTable.patientFName
        : sortBy === "email"
        ? PatientsTable.email
        : sortBy === "dob"
        ? PatientsTable.dob
        : PatientsTable.createdAt;

    const orderDir = sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

    const [patients, [{ count }]] = await Promise.all([
      db
        .select({
          id: PatientsTable.id,
          patientId: PatientsTable.patientId,
          vendorId: PatientsTable.vendorId,
          patientFName: PatientsTable.patientFName,
          patientMName: PatientsTable.patientMName,
          patientLName: PatientsTable.patientLName,
          gender: PatientsTable.gender,
          dob: PatientsTable.dob,
          age: PatientsTable.age,
          email: PatientsTable.email,
          mobileNo: PatientsTable.mobileNo,
          phoneNo: PatientsTable.phoneNo,
          nationality: PatientsTable.nationality,
          ethinicity: PatientsTable.ethinicity,
          lifestyle: PatientsTable.lifestyle,
          smoking: PatientsTable.smoking,
          isActive: PatientsTable.isActive,
          mrno: PatientsTable.mrno,
          tag: PatientsTable.tag,
          hospitalName: PatientsTable.hospitalName,
          doctorFName: PatientsTable.doctorFName,
          doctorLName: PatientsTable.doctorLName,
          height: PatientsTable.height,
          weight: PatientsTable.weight,
          isPatientConsent: PatientsTable.isPatientConsent,
          createdAt: PatientsTable.createdAt,
          updatedAt: PatientsTable.updatedAt,
          vendorName: VendorsTable.name,
          vendorCode: VendorsTable.vendorCode,
          createdByName: UsersTable.name,
        })
        .from(PatientsTable)
        .leftJoin(VendorsTable, eq(PatientsTable.vendorId, VendorsTable.id))
        .leftJoin(UsersTable, eq(PatientsTable.createdBy, UsersTable.id))
        .where(where)
        .orderBy(orderDir)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(PatientsTable)
        .where(where),
    ]);

    return NextResponse.json(
      {
        patients,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// POST - Create a new patient
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("Received patient data:", JSON.stringify(body, null, 2));
    console.log("Consent value received:", body.isPatientConsent, "Type:", typeof body.isPatientConsent);

    const {
      patientId,
      vendorId,
      createdBy,
      // Doctor info
      doctorFName,
      doctorLName,
      hospitalName,
      clinic,
      docMobileNo,
      docEmail,
      // Patient personal info
      patientFName,
      patientMName,
      patientLName,
      gender,
      dob,
      age,
      height,
      weight,
      // Address
      address,
      // Contact
      phoneNo,
      mobileNo,
      email,
      // Demographic
      nationality,
      ethinicity,
      lifestyle,
      // Medical
      patientHistory,
      medication,
      familyHistory,
      familyHistoryDetails,
      isPatientConsent,
      mrno,
      TRF,
      tag,
      // Lifestyle & health
      smoking,
      alcoholic,
      medicalHistory,
      medication2,
      familyHistory1,
      relationship,
      // Cardiovascular
      chestPain,
      cardiacEnzyme,
      // Lipid profile
      cholestrol,
      hdl,
      cholestrolHdlRatio,
      ldl,
      hdl_ldlRatio,
      triglycerides,
      // Blood health
      hbValue,
      // Vital signs
      bp_systolic,
      bp_diastolic,
      // Medications & reports
      medications,
      echocardiography,
      nct,
      metabolomeRatio,
    } = body;

    // Validate required fields (isPatientConsent is NOT required since it can be 0)
    const requiredFields = {
      patientId,
      vendorId,
      createdBy,
      doctorFName,
      hospitalName,
      patientFName,
      patientLName,
      gender,
      age,
      height,
      weight,
      address,
      email,
      ethinicity,
      lifestyle,
      smoking,
      chestPain,
      cardiacEnzyme,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", fields: missingFields },
        { status: 400 }
      );
    }

    // Ensure isPatientConsent is an integer (0 or 1)
    let consentValue = 0;
    if (isPatientConsent !== undefined && isPatientConsent !== null) {
      consentValue = typeof isPatientConsent === 'boolean' 
        ? (isPatientConsent ? 1 : 0)
        : (Number(isPatientConsent) === 1 ? 1 : 0);
    }

    console.log("Final consent value to save:", consentValue);

    // Check if patientId already exists
    const [existing] = await db
      .select({ id: PatientsTable.id })
      .from(PatientsTable)
      .where(eq(PatientsTable.patientId, patientId))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Patient ID already exists" },
        { status: 409 }
      );
    }

    // Check if email already exists
    const [emailExists] = await db
      .select({ id: PatientsTable.id })
      .from(PatientsTable)
      .where(eq(PatientsTable.email, email))
      .limit(1);

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const [patient] = await db
      .insert(PatientsTable)
      .values({
        patientId,
        vendorId,
        createdBy,
        doctorFName,
        doctorLName,
        hospitalName,
        clinic,
        docMobileNo,
        docEmail,
        patientFName,
        patientMName,
        patientLName,
        gender,
        dob,
        age,
        height,
        weight,
        address,
        phoneNo,
        mobileNo,
        email,
        nationality,
        ethinicity,
        lifestyle,
        patientHistory,
        medication,
        familyHistory,
        familyHistoryDetails,
        isPatientConsent: consentValue, // Save as integer (0 or 1)
        mrno,
        TRF,
        tag,
        smoking,
        alcoholic: alcoholic ? 1 : 0,
        medicalHistory,
        medication2,
        familyHistory1,
        relationship,
        chestPain,
        cardiacEnzyme,
        cholestrol,
        hdl,
        cholestrolHdlRatio,
        ldl,
        hdl_ldlRatio,
        triglycerides,
        hbValue,
        bp_systolic,
        bp_diastolic,
        medications,
        echocardiography,
        nct,
        metabolomeRatio,
      })
      .returning();

    console.log("Patient created with consent:", patient.isPatientConsent);

    return NextResponse.json(
      { message: "Patient created successfully", data: patient },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}