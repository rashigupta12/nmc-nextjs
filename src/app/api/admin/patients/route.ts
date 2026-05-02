export const runtime = "nodejs";

import { db } from "@/db";
import { PatientsTable, VendorsTable, UsersTable } from "@/db/schema";
import { eq, ilike, and, or, desc, asc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// GET - List all patients with optional filters (filtered by vendor)
export async function GET(req: NextRequest) {
  try {
    // Get session to verify vendor
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendorId = session.user.id;
    const vendorCode = session.user.vendorCode;

    console.log("Fetching patients for vendor:", { vendorId, vendorCode });

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const offset = (page - 1) * limit;

    const search = searchParams.get("search") ?? "";
    const gender = searchParams.get("gender");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") ?? "desc";

    // Build where conditions - ALWAYS filter by vendor
    const conditions = [eq(PatientsTable.vendorId, vendorId)];

  if (search) {
  const searchCondition = or(
    ilike(PatientsTable.patientFName, `%${search}%`),
    ilike(PatientsTable.patientLName, `%${search}%`),
    ilike(PatientsTable.email, `%${search}%`),
    ilike(PatientsTable.patientId, `%${search}%`),
    ilike(PatientsTable.mrno, `%${search}%`)
  );
  if (searchCondition) conditions.push(searchCondition);
}

    if (gender) {
      conditions.push(eq(PatientsTable.gender, gender as "M" | "F" | "Other"));
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(PatientsTable.isActive, isActive === "true"));
    }

    const where = and(...conditions);

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

    console.log(`Found ${patients.length} patients for vendor ${vendorCode}`);

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
    // Get session to verify vendor
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Verify the vendorId matches the session user
    if (vendorId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: Vendor ID mismatch" },
        { status: 403 }
      );
    }

    // Validate required fields
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

    // Check if patientId already exists for this vendor
    const [existing] = await db
      .select({ id: PatientsTable.id })
      .from(PatientsTable)
      .where(
        and(
          eq(PatientsTable.patientId, patientId),
          eq(PatientsTable.vendorId, vendorId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Patient ID already exists for this vendor" },
        { status: 409 }
      );
    }

    // Check if email already exists for this vendor
    const [emailExists] = await db
      .select({ id: PatientsTable.id })
      .from(PatientsTable)
      .where(
        and(
          eq(PatientsTable.email, email),
          eq(PatientsTable.vendorId, vendorId)
        )
      )
      .limit(1);

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already exists for this vendor" },
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
        isPatientConsent: consentValue,
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