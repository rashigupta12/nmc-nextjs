// app/api/admin/patients/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { db } from "@/db";
import { PatientsTable, VendorsTable, UsersTable, OrdersTable, SamplesTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET - Get single patient with full details
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const [patient] = await db
      .select({
        // Core fields
        id: PatientsTable.id,
        patientId: PatientsTable.patientId,
        vendorId: PatientsTable.vendorId,
        createdBy: PatientsTable.createdBy,
        // Doctor info
        doctorFName: PatientsTable.doctorFName,
        doctorLName: PatientsTable.doctorLName,
        hospitalName: PatientsTable.hospitalName,
        clinic: PatientsTable.clinic,
        docMobileNo: PatientsTable.docMobileNo,
        docEmail: PatientsTable.docEmail,
        // Personal info
        patientFName: PatientsTable.patientFName,
        patientMName: PatientsTable.patientMName,
        patientLName: PatientsTable.patientLName,
        gender: PatientsTable.gender,
        dob: PatientsTable.dob,
        age: PatientsTable.age,
        height: PatientsTable.height,
        weight: PatientsTable.weight,
        // Address & contact
        address: PatientsTable.address,
        phoneNo: PatientsTable.phoneNo,
        mobileNo: PatientsTable.mobileNo,
        email: PatientsTable.email,
        // Demographic
        nationality: PatientsTable.nationality,
        ethinicity: PatientsTable.ethinicity,
        lifestyle: PatientsTable.lifestyle,
        // Medical
        patientHistory: PatientsTable.patientHistory,
        medication: PatientsTable.medication,
        familyHistory: PatientsTable.familyHistory,
        familyHistoryDetails: PatientsTable.familyHistoryDetails,
        isPatientConsent: PatientsTable.isPatientConsent,
        pdf_file_name: PatientsTable.pdf_file_name,
        is_pdf_uploaded: PatientsTable.is_pdf_uploaded,
        mrno: PatientsTable.mrno,
        TRF: PatientsTable.TRF,
        tag: PatientsTable.tag,
        // Lifestyle & health
        smoking: PatientsTable.smoking,
        alcoholic: PatientsTable.alcoholic,
        medicalHistory: PatientsTable.medicalHistory,
        medication2: PatientsTable.medication2,
        familyHistory1: PatientsTable.familyHistory1,
        relationship: PatientsTable.relationship,
        // Cardiovascular
        chestPain: PatientsTable.chestPain,
        cardiacEnzyme: PatientsTable.cardiacEnzyme,
        // Lipid profile
        cholestrol: PatientsTable.cholestrol,
        hdl: PatientsTable.hdl,
        cholestrolHdlRatio: PatientsTable.cholestrolHdlRatio,
        ldl: PatientsTable.ldl,
        hdl_ldlRatio: PatientsTable.hdl_ldlRatio,
        triglycerides: PatientsTable.triglycerides,
        // Blood & vitals
        hbValue: PatientsTable.hbValue,
        bp_systolic: PatientsTable.bp_systolic,
        bp_diastolic: PatientsTable.bp_diastolic,
        // Reports
        medications: PatientsTable.medications,
        echocardiography: PatientsTable.echocardiography,
        nct: PatientsTable.nct,
        metabolomeRatio: PatientsTable.metabolomeRatio,
        // Meta
        isActive: PatientsTable.isActive,
        createdAt: PatientsTable.createdAt,
        updatedAt: PatientsTable.updatedAt,
        // Joins
        vendorName: VendorsTable.name,
        vendorCode: VendorsTable.vendorCode,
        createdByName: UsersTable.name,
        createdByEmail: UsersTable.email,
      })
      .from(PatientsTable)
      .leftJoin(VendorsTable, eq(PatientsTable.vendorId, VendorsTable.id))
      .leftJoin(UsersTable, eq(PatientsTable.createdBy, UsersTable.id))
      .where(eq(PatientsTable.id, params.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch summary counts for orders and samples
    const [[{ orderCount }], [{ sampleCount }]] = await Promise.all([
      db
        .select({ orderCount: sql<number>`count(*)::int` })
        .from(OrdersTable)
        .where(eq(OrdersTable.patientId, params.id)),

      db
        .select({ sampleCount: sql<number>`count(*)::int` })
        .from(SamplesTable)
        .where(eq(SamplesTable.patientId, params.id)),
    ]);

    return NextResponse.json(
      {
        patient: {
          ...patient,
          _counts: {
            orders: orderCount,
            samples: sampleCount,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

// PUT - Update patient
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const body = await req.json();

    // Check if patient exists
    const [existingPatient] = await db
      .select({ id: PatientsTable.id, email: PatientsTable.email })
      .from(PatientsTable)
      .where(eq(PatientsTable.id, params.id))
      .limit(1);

    if (!existingPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // If email is being changed, check uniqueness
    if (body.email && body.email !== existingPatient.email) {
      const [emailExists] = await db
        .select({ id: PatientsTable.id })
        .from(PatientsTable)
        .where(eq(PatientsTable.email, body.email))
        .limit(1);

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use by another patient" },
          { status: 409 }
        );
      }
    }

    // Build update payload — only include fields present in body
    const updateData: any = {
      updatedAt: new Date(),
    };

    const updatableFields = [
      // Doctor info
      "doctorFName", "doctorLName", "hospitalName", "clinic",
      "docMobileNo", "docEmail",
      // Personal info
      "patientFName", "patientMName", "patientLName",
      "gender", "dob", "age", "height", "weight",
      // Address & contact
      "address", "phoneNo", "mobileNo", "email",
      // Demographic
      "nationality", "ethinicity", "lifestyle",
      // Medical
      "patientHistory", "medication", "familyHistory",
      "familyHistoryDetails", "isPatientConsent",
      "pdf_file_name", "is_pdf_uploaded", "mrno", "TRF", "tag",
      // Lifestyle
      "smoking", "alcoholic", "medicalHistory", "medication2",
      "familyHistory1", "relationship",
      // Cardiovascular
      "chestPain", "cardiacEnzyme",
      // Lipid profile
      "cholestrol", "hdl", "cholestrolHdlRatio", "ldl",
      "hdl_ldlRatio", "triglycerides",
      // Blood & vitals
      "hbValue", "bp_systolic", "bp_diastolic",
      // Reports
      "medications", "echocardiography", "nct", "metabolomeRatio",
      // Meta
      "isActive",
    ] as const;

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const [updatedPatient] = await db
      .update(PatientsTable)
      .set(updateData)
      .where(eq(PatientsTable.id, params.id))
      .returning();

    return NextResponse.json(
      { message: "Patient updated successfully", patient: updatedPatient },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete (deactivate) patient
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const [patient] = await db
      .select({ id: PatientsTable.id, isActive: PatientsTable.isActive })
      .from(PatientsTable)
      .where(eq(PatientsTable.id, params.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Check for active orders before deactivating
    const [{ orderCount }] = await db
      .select({ orderCount: sql<number>`count(*)::int` })
      .from(OrdersTable)
      .where(eq(OrdersTable.patientId, params.id));

    if (orderCount > 0) {
      // Soft delete — preserve data integrity
      await db
        .update(PatientsTable)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(PatientsTable.id, params.id));

      return NextResponse.json(
        {
          message: "Patient deactivated successfully (has associated orders)",
          softDeleted: true,
        },
        { status: 200 }
      );
    }

    // Hard delete if no orders exist
    await db
      .delete(PatientsTable)
      .where(eq(PatientsTable.id, params.id));

    return NextResponse.json(
      { message: "Patient deleted successfully", softDeleted: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 }
    );
  }
}