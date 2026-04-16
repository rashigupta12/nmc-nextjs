// =============================================================================
// NeoTech / NMC Genetics Platform — PostgreSQL Schema (Drizzle ORM)
// Version: 3.0 — Full Rewrite
//
// Database Responsibility Split:
//   PostgreSQL (this file) — All business management: users, vendors, patients,
//                            orders, samples, shipments, billing, helpdesk, audit.
//   MongoDB                — Genetic core only: rsid variants, report engine,
//                            condition-specific report collections, raw data.
//
// Cross-DB Bridge:
//   sampleId (text, e.g. "BP1SL000001") is generated here and written into
//   MongoDB GeneReportTemp documents. pdfPath on SamplesTable is written back
//   by the report engine upon PDF generation.
//
// Roles (3 total):
//   SUPER_ADMIN      — NeoTech god mode. Approves vendors, manages platform.
//   ADMIN            — NeoTech ops. Test catalog, QC, report generation.
//   BUSINESS_PARTNER — Vendor/clinic. Registers, gets approved, manages own data.
// =============================================================================

import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, InferInsertModel, InferSelectModel } from "drizzle-orm";

// =============================================================================
// ENUMS
// =============================================================================

/**
 * System-wide user roles. Only 3 roles exist in this platform.
 */
export const UserRole = pgEnum("user_role", [
  "SUPER_ADMIN",       // Full platform access. Approves vendors, manages everything.
  "ADMIN",             // NeoTech ops staff. Test catalog, QC, data processing, reports.
  "BUSINESS_PARTNER",  // Vendor / clinic. Manages own patients, orders, samples.
]);

/**
 * Vendor registration/approval lifecycle.
 * A vendor cannot log in until their status is APPROVED.
 */
export const VendorStatus = pgEnum("vendor_status", [
  "PENDING",   // Registered, awaiting admin review.
  "APPROVED",  // Approved by SUPER_ADMIN. Login credentials sent via email.
  "REJECTED",  // Rejected by SUPER_ADMIN with reason.
  "SUSPENDED", // Temporarily disabled by SUPER_ADMIN.
]);

/** Sample type as collected. */
export const SampleType = pgEnum("sample_type", [
  "SALIVA",
  "BLOOD",
  "TISSUE",
]);

/** Sample lifecycle status through the lab pipeline. */
export const SampleStatus = pgEnum("sample_status", [
  "CREATED",     // Sample record created by BP.
  "SHIPPED",     // Included in a shipment to NMC lab.
  "RECEIVED",    // Lab has physically received and accepted the sample.
  "QC_PASSED",   // Quality check passed. NMCG ID assigned.
  "QC_FAILED",   // Quality check failed. Rejected with reason.
  "PROCESSING",  // Raw genetic data uploaded; report engine running.
  "READY",       // Genetic data validated, ready for report generation.
  "REPORT_GENERATED", // Report created (saved as PDF, not yet released).
  "RELEASED",    // Report released to BP / patient.
  "RESAMPLING",  // Resample requested.
]);

/** Shipment tracking status (physical movement of kits to NMC lab). */
export const ShipmentStatus = pgEnum("shipment_status", [
  "CREATED",
  "COURIERED",   // Dispatched by BP with courier details.
  "IN_TRANSIT",
  "RECEIVED",    // Received at NMC lab.
  "PARTIALLY_RECEIVED", // Some samples accepted, some rejected.
]);

/** Order payment status. */
export const PaymentStatus = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

/** Support ticket lifecycle. */
export const TicketStatus = pgEnum("ticket_status", [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

/** Support ticket priority. */
export const TicketPriority = pgEnum("ticket_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

/** What the BP wants delivered: report, raw data, or both. */
export const Deliverable = pgEnum("deliverable", [
  "REPORT",
  "RAW_DATA",
  "BOTH",
]);

/** Notification recipients. */
export const NotifyTarget = pgEnum("notify_target", [
  "SUBJECT",          // The patient.
  "BUSINESS_PARTNER", // The vendor.
  "BOTH",
]);

// =============================================================================
// USERS
// =============================================================================

/**
 * All users in the system: SUPER_ADMIN, ADMIN, and BUSINESS_PARTNER.
 *
 * BUSINESS_PARTNER users are linked to a VendorsTable row via vendorId.
 * SUPER_ADMIN and ADMIN users have vendorId = NULL.
 *
 * A BUSINESS_PARTNER user cannot log in until their vendor is APPROVED.
 * On approval, a default password is generated and a reset link is emailed.
 * isPasswordReset tracks whether the mandatory first-login reset is done.
 */
export const UsersTable = pgTable(
  "users",
  {
    id:               uuid("id").defaultRandom().primaryKey().notNull(),
    role:             UserRole("role").notNull(),

    // Core identity
    name:             text("name").notNull(),
    email:            text("email").notNull(),         // Encrypted at app layer
    password:         text("password").notNull(),
    phone:            text("phone"),                   // Encrypted at app layer

    // Tenant link — NULL for SUPER_ADMIN and ADMIN
    vendorId:         uuid("vendor_id"),

    // Auth state
    isActive:         boolean("is_active").default(true).notNull(),
    isPasswordReset:  boolean("is_password_reset").default(false).notNull(), // Must reset on first login
    emailVerified:    timestamp("email_verified", { mode: "date" }),
    lastLoginAt:      timestamp("last_login_at", { mode: "date" }),

    createdAt:        timestamp("created_at").defaultNow().notNull(),
    updatedAt:        timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_email_key").on(t.email),
    index("users_role_idx").on(t.role),
    index("users_vendor_idx").on(t.vendorId),
  ]
);

export type User    = InferSelectModel<typeof UsersTable>;
export type NewUser = InferInsertModel<typeof UsersTable>;

// =============================================================================
// AUTH TOKENS
// =============================================================================

export const EmailVerificationTokenTable = pgTable(
  "email_verification_tokens",
  {
    id:        uuid("id").defaultRandom().primaryKey().notNull(),
    email:     text("email").notNull(),
    token:     uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (t) => [
    uniqueIndex("evt_email_token_key").on(t.email, t.token),
    uniqueIndex("evt_token_key").on(t.token),
  ]
);

export const PasswordResetTokenTable = pgTable(
  "password_reset_tokens",
  {
    id:        uuid("id").defaultRandom().primaryKey().notNull(),
    email:     text("email").notNull(),
    token:     uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (t) => [
    uniqueIndex("prt_email_token_key").on(t.email, t.token),
    uniqueIndex("prt_token_key").on(t.token),
  ]
);

// =============================================================================
// VENDORS (BUSINESS PARTNERS)
// =============================================================================

/**
 * One row per business partner / vendor organisation.
 *
 * Registration flow:
 *   1. BP fills in registration form → row created with status PENDING.
 *   2. SUPER_ADMIN reviews → sets status to APPROVED or REJECTED.
 *   3. On APPROVED: UsersTable row created, default password emailed to BP.
 *   4. BP must reset password on first login (isPasswordReset = false → true).
 *
 * Fields with "// Encrypted" are encrypted at the application layer.
 */
export const VendorsTable = pgTable(
  "vendors",
  {
    id:             uuid("id").defaultRandom().primaryKey().notNull(),
    status:         VendorStatus("status").default("PENDING").notNull(),

    // --- Individual / Company toggle ---
    isCompany:      boolean("is_company").default(false).notNull(),
    code:           text("code"),            // BP short code / reference

    // --- Core identity ---
    name:           text("name").notNull(),
    contactPerson:  text("contact_person"),
    phone:          text("phone"),           // Encrypted
    email:          text("email").notNull(), // Encrypted
    address:        text("address"),         // Encrypted
    city:           text("city"),
    state:          text("state"),
    country:        text("country"),
    zipCode:        text("zip_code"),
    website:        text("website"),

    // Logo stored as URL (uploaded to S3)
    logo:           text("logo"),

    // --- Company-only fields ---
    cinNumber:      text("cin_number"),
    vatNumber:      text("vat_number"),
    gstNumber:      text("gst_number"),

    // --- Bank details (JSONB — encrypted at app layer) ---
    // Shape: { accountNo, accountName, swiftCode, ifscCode }
    bankDetails:    jsonb("bank_details"),

    // --- Uploaded documents ---
    // Shape: [{ documentName: string, documentUrl: string }]
    documents:      jsonb("documents"),

    // --- Approval tracking ---
    approvedBy:     uuid("approved_by"),    // References UsersTable (SUPER_ADMIN)
    approvedAt:     timestamp("approved_at", { mode: "date" }),
    rejectionReason: text("rejection_reason"),

    // Soft delete
    deletedAt:      timestamp("deleted_at", { mode: "date" }),

    createdAt:      timestamp("created_at").defaultNow().notNull(),
    updatedAt:      timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("vendors_status_idx").on(t.status),
    index("vendors_email_idx").on(t.email),
    index("vendors_name_idx").on(t.name),
  ]
);

export type Vendor    = InferSelectModel<typeof VendorsTable>;
export type NewVendor = InferInsertModel<typeof VendorsTable>;

// =============================================================================
// VENDOR SETTINGS
// =============================================================================

/**
 * Per-vendor operational and white-label settings.
 * One row per vendor, created automatically on vendor approval.
 *
 * Separated from VendorsTable to keep vendor registration lean
 * and allow settings to evolve independently.
 */
export const VendorSettingsTable = pgTable(
  "vendor_settings",
  {
    id:       uuid("id").defaultRandom().primaryKey().notNull(),
    vendorId: uuid("vendor_id").notNull().unique(),

    // --- Deliverables ---
    deliverable: Deliverable("deliverable").default("REPORT").notNull(),

    // --- Raw data delivery ---
    // S3 bucket name for raw data / report delivery. Set by Admin after IT provision.
    s3BucketName:      text("s3_bucket_name"),
    rawDataEmail:      text("raw_data_email"), // Email to receive raw data files

    // --- Privacy settings ---
    hidePersonalInfo:  boolean("hide_personal_info").default(false).notNull(),
    passwordProtectedReport: boolean("password_protected_report").default(false).notNull(),

    // Password rule for protected reports:
    // "NAME4_DOB"     → first 4 letters of name + DDMMYY
    // "NAME4_MOBILE4" → first 4 letters of name + first 4 of mobile
    passwordRule:      text("password_rule").default("NAME4_DOB").notNull(),

    // --- Notification settings ---
    notifyTarget:      NotifyTarget("notify_target").default("BOTH").notNull(),
    // Which notification events are enabled:
    // Shape: { forgotPassword, changePassword, shipmentCreated, shipmentCouriered,
    //          shipmentReceived, qaPassed, sampleRejected, reportGenerated }
    notificationEvents: jsonb("notification_events"),

    // --- White labeling (report branding) ---
    whiteLabel:        boolean("white_label").default(false).notNull(),

    // General report settings:
    // Shape: { welcomeNote, legalDisclaimer, hasBlankPages, hasSectionCover,
    //          hasSummaryPages, hasBackCover }
    reportConfig:      jsonb("report_config"),

    // Font settings:
    // Shape: { baseFont, baseFontSize, nameTitle, aboutUsImage, aboutUsContent }
    fontConfig:        jsonb("font_config"),

    // Signatures:
    // Shape: [{ name, designation, signatureUrl }]
    signatures:        jsonb("signatures"),

    // Cover page images per report section:
    // Shape: { wellness: { frontPage, backCover, dietLeft, dietRight,
    //          weightLeft, weightRight, fitnessLeft, fitnessRight,
    //          detoxLeft, detoxRight }, ... }
    coverPages:        jsonb("cover_pages"),

    createdAt:         timestamp("created_at").defaultNow().notNull(),
    updatedAt:         timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("vendor_settings_vendor_idx").on(t.vendorId),
  ]
);

export type VendorSettings    = InferSelectModel<typeof VendorSettingsTable>;
export type NewVendorSettings = InferInsertModel<typeof VendorSettingsTable>;

// =============================================================================
// TEST CATALOG
// =============================================================================

/**
 * Platform-level test catalog. Created and managed by ADMIN.
 *
 * Hierarchy via parentTestId:
 *   NULL parentTestId = root package (e.g. "Wellness All")
 *   parentTestId set  = sub-test within a package (e.g. "Diet", "Skin")
 *
 * Mirrors the MongoDB TestMaster collection so order creation
 * does not require a MongoDB round-trip.
 */
export const TestCatalogTable = pgTable(
  "test_catalog",
  {
    id:           uuid("id").defaultRandom().primaryKey().notNull(),
    testCode:     text("test_code").notNull(),    // e.g. "NMC-WL01", "NMC-SK01"
    testName:     text("test_name").notNull(),    // e.g. "Wellness All", "Skin"
    alias:        text("alias"),                  // Short display name
    description:  text("description"),

    // Hierarchy
    parentTestId: uuid("parent_test_id"),         // NULL = root level
    subParentOf:  uuid("sub_parent_of"),          // For 3-level hierarchies if needed

    tatDays:      integer("tat_days").notNull(),  // Turnaround time in calendar days
    price:        numeric("price", { precision: 10, scale: 2 }), // Default platform price

    isActive:     boolean("is_active").default(true).notNull(),
    createdBy:    uuid("created_by").notNull(),   // ADMIN who created this entry

    createdAt:    timestamp("created_at").defaultNow().notNull(),
    updatedAt:    timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("test_catalog_code_key").on(t.testCode),
    index("test_catalog_parent_idx").on(t.parentTestId),
    index("test_catalog_active_idx").on(t.isActive),
  ]
);

export type TestCatalog    = InferSelectModel<typeof TestCatalogTable>;
export type NewTestCatalog = InferInsertModel<typeof TestCatalogTable>;

// =============================================================================
// PRICING (VENDOR-LEVEL OVERRIDES)
// =============================================================================

/**
 * Vendor-specific price overrides for tests.
 * If no override exists, the price from TestCatalogTable.price is used.
 *
 * Resolution order:
 *   1. Vendor-specific row (vendorId NOT NULL, testCatalogId matches)
 *   2. Platform default (TestCatalogTable.price)
 */
export const PricelistTable = pgTable(
  "pricelist",
  {
    id:            uuid("id").defaultRandom().primaryKey().notNull(),
    testCatalogId: uuid("test_catalog_id").notNull(),
    vendorId:      uuid("vendor_id").notNull(),
    price:         numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency:      text("currency").default("INR").notNull(),
    isActive:      boolean("is_active").default(true).notNull(),
    effectiveFrom: timestamp("effective_from", { mode: "date" }).defaultNow().notNull(),
    effectiveTo:   timestamp("effective_to", { mode: "date" }),
    createdAt:     timestamp("created_at").defaultNow().notNull(),
    updatedAt:     timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("pricelist_test_vendor_key").on(t.testCatalogId, t.vendorId),
    index("pricelist_vendor_idx").on(t.vendorId),
  ]
);

export type Pricelist    = InferSelectModel<typeof PricelistTable>;
export type NewPricelist = InferInsertModel<typeof PricelistTable>;

// =============================================================================
// PATIENTS
// =============================================================================

/**
 * Patient / Subject table.
 *
 * Scope: unique per vendor. The same individual at two different
 * vendors = two separate rows.
 *
 * PII fields (name, phone, email, address) are encrypted at the app layer.
 * After QC is passed on a sample, personal info is hidden from non-privileged
 * roles — enforced at the API layer, not the schema layer.
 *
 * Full genetic and clinical data lives in MongoDB. This table stores
 * the data needed for order management, report addressing, and filtering.
 */
export const PatientsTable = pgTable(
  "patients",
  {
    id:              uuid("id").defaultRandom().primaryKey().notNull(),

    /**
     * Human-readable patient ID. Auto-generated.
     * Format for BP patients:  "BP1PT000001"
     * Format for NMC direct:   "NMCPT000001"
     * Used as the reference key into MongoDB.
     */
    patientId:       text("patient_id").notNull(),

    vendorId:        uuid("vendor_id").notNull(),    // Owning vendor
    createdBy:       uuid("created_by").notNull(),   // User who created this record

    // --- Personal Details (all PII encrypted at app layer) ---
    firstName:       text("first_name").notNull(),
    middleName:      text("middle_name"),
    lastName:        text("last_name").notNull(),
    gender:          text("gender").notNull(),        // "M" | "F" | "O"
    dob:             text("dob"),                     // DD/MM/YYYY
    age:             integer("age"),
    height:          numeric("height", { precision: 5, scale: 2 }), // cm
    weight:          numeric("weight", { precision: 5, scale: 2 }), // kg
    nationality:     text("nationality"),
    ethnicity:       text("ethnicity"),               // Required per workflow

    // --- Contact ---
    phone:           text("phone"),                   // Encrypted
    email:           text("email"),                   // Encrypted

    // --- Address ---
    address:         text("address"),                 // Encrypted
    city:            text("city"),
    state:           text("state"),
    country:         text("country"),
    zipCode:         text("zip_code"),

    // --- Medical History (stored as JSONB — full detail in MongoDB) ---
    // Shape: {
    //   patientHistory: string,       // Known diseases e.g. Diabetes, Allergy
    //   medication: string,
    //   familyHistory: [{ relationship: string, disease: string }],
    //   lifestyle: { smoker: boolean, alcoholic: string },
    //   // AMI study criteria fields if applicable:
    //   amiCriteria: { ... }
    // }
    medicalHistory:  jsonb("medical_history"),

    isActive:        boolean("is_active").default(true).notNull(),
    createdAt:       timestamp("created_at").defaultNow().notNull(),
    updatedAt:       timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    // patientId unique within a vendor (not globally)
    uniqueIndex("patients_vendor_patient_key").on(t.vendorId, t.patientId),
    index("patients_vendor_idx").on(t.vendorId),
    index("patients_name_idx").on(t.firstName, t.lastName),
  ]
);

export type Patient    = InferSelectModel<typeof PatientsTable>;
export type NewPatient = InferInsertModel<typeof PatientsTable>;

// =============================================================================
// ORDERS
// =============================================================================

/**
 * One order per patient visit / test request.
 * An order links a patient to one or more test selections.
 * Multiple samples (one per test type) are created under an order.
 *
 * Created by BUSINESS_PARTNER or ADMIN (on behalf of BP).
 * When created on behalf of BP by ADMIN, an email is sent to BP confirming entry.
 */
export const OrdersTable = pgTable(
  "orders",
  {
    id:            uuid("id").defaultRandom().primaryKey().notNull(),

    /**
     * Human-readable order reference. Auto-generated.
     * e.g. "OR-23042610889"
     */
    orderNo:       text("order_no").notNull(),

    vendorId:      uuid("vendor_id").notNull(),
    patientId:     uuid("patient_id").notNull(),  // References PatientsTable.id
    createdBy:     uuid("created_by").notNull(),  // References UsersTable.id

    // If ADMIN created this on behalf of a BP, log which BP
    onBehalfOf:    uuid("on_behalf_of"),          // References VendorsTable.id

    totalAmount:   numeric("total_amount", { precision: 10, scale: 2 }),
    currency:      text("currency").default("INR").notNull(),
    paymentStatus: PaymentStatus("payment_status").default("PENDING").notNull(),

    remark:        text("remark"),
    orderDate:     timestamp("order_date", { mode: "date" }).defaultNow().notNull(),

    createdAt:     timestamp("created_at").defaultNow().notNull(),
    updatedAt:     timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("orders_order_no_key").on(t.orderNo),
    index("orders_vendor_idx").on(t.vendorId),
    index("orders_patient_idx").on(t.patientId),
    index("orders_date_idx").on(t.orderDate),
  ]
);

export type Order    = InferSelectModel<typeof OrdersTable>;
export type NewOrder = InferInsertModel<typeof OrdersTable>;

// =============================================================================
// SAMPLES
// =============================================================================

/**
 * One sample per test type within an order.
 * Tracks the physical sample + genetic data pipeline + report status.
 *
 * Cross-database bridge:
 *   sampleId   → written into MongoDB GeneReportTemp as the linking key.
 *   nmcgId     → internal NMC lab ID (format: NMCGYY000001), assigned on QC pass.
 *   pdfPath    → written back here by the MongoDB report engine on PDF generation.
 *   mongoReportId → MongoDB document _id of the generated report document.
 */
export const SamplesTable = pgTable(
  "samples",
  {
    id:              uuid("id").defaultRandom().primaryKey().notNull(),

    /**
     * Auto-generated public sample ID.
     * BP patient:   "BP1SL000001"
     * NMC direct:   "NMCSL000001"
     * Printed on reports and kit labels.
     */
    sampleId:        text("sample_id").notNull(),

    /**
     * Internal NMC lab ID. Assigned when QC is passed.
     * Format: NMCGYY000001 (YY = 2-digit year, 6-digit sequence).
     * Used on barcodes and all internal NMC communication.
     */
    nmcgId:          text("nmcg_id"),

    /**
     * Optional additional ID supplied by the Business Partner.
     * If provided, printed on report instead of sampleId.
     */
    partnerSampleId: text("partner_sample_id"),

    orderId:         uuid("order_id").notNull(),        // References OrdersTable.id
    vendorId:        uuid("vendor_id").notNull(),
    patientId:       uuid("patient_id").notNull(),      // References PatientsTable.id
    testCatalogId:   uuid("test_catalog_id").notNull(), // Which test this sample is for
    createdBy:       uuid("created_by").notNull(),

    // --- Physical sample details ---
    sampleType:      SampleType("sample_type").notNull(),
    kitBarcode:      text("kit_barcode"),               // GFX / Kit ID (optional)
    trfUrl:          text("trf_url"),                   // S3 URL of uploaded TRF / consent form
    dateSampleTaken: timestamp("date_sample_taken", { mode: "date" }),

    // --- Referring doctor / hospital ---
    // Shape: { firstName, lastName, hospitalName, address, city, state,
    //          country, zipCode, phone, email }
    referringDoctor: jsonb("referring_doctor"),

    // --- Pipeline status ---
    status:          SampleStatus("status").default("CREATED").notNull(),

    // QC rejection
    qcRejectionReason: text("qc_rejection_reason"),

    // Timeline
    shippedAt:         timestamp("shipped_at",     { mode: "date" }),
    receivedAt:        timestamp("received_at",    { mode: "date" }),
    qcPassedAt:        timestamp("qc_passed_at",   { mode: "date" }),
    processedAt:       timestamp("processed_at",   { mode: "date" }),
    reportGeneratedAt: timestamp("report_generated_at", { mode: "date" }),
    releasedAt:        timestamp("released_at",    { mode: "date" }),
    tatDueAt:          timestamp("tat_due_at",     { mode: "date" }),

    // --- Genetic data pipeline flags ---
    csvUploaded:       boolean("csv_uploaded").default(false).notNull(),
    csvValidated:      boolean("csv_validated").default(false).notNull(),
    // Validation summary for quick display without MongoDB call:
    // Shape: { total: number, valid: number, invalid: number, errors: [] }
    validationSummary: jsonb("validation_summary"),

    // --- Cross-DB report pointers ---
    // Written by MongoDB report engine on PDF generation:
    pdfPath:           text("pdf_path"),          // S3 path to generated PDF
    mongoReportId:     text("mongo_report_id"),   // MongoDB _id of report document
    reportGenerated:   boolean("report_generated").default(false).notNull(),

    // Report release
    reportReleased:    boolean("report_released").default(false).notNull(),
    reportPasswordProtected: boolean("report_password_protected").default(false).notNull(),

    createdAt:         timestamp("created_at").defaultNow().notNull(),
    updatedAt:         timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("samples_sample_id_key").on(t.sampleId),
    uniqueIndex("samples_nmcg_id_key").on(t.nmcgId),
    index("samples_order_idx").on(t.orderId),
    index("samples_vendor_idx").on(t.vendorId),
    index("samples_patient_idx").on(t.patientId),
    index("samples_status_idx").on(t.status),
    index("samples_tat_idx").on(t.tatDueAt),
    index("samples_partner_sample_idx").on(t.partnerSampleId),
  ]
);

export type Sample    = InferSelectModel<typeof SamplesTable>;
export type NewSample = InferInsertModel<typeof SamplesTable>;

// =============================================================================
// SHIPMENTS
// =============================================================================

/**
 * A shipment bundles one or more samples for physical transport to NMC lab.
 * One shipment → many samples (via ShipmentSamplesTable junction).
 *
 * Created by BUSINESS_PARTNER. Received and processed by ADMIN (QC role).
 * On acceptance: nmcgId is assigned to each sample in SamplesTable.
 * On rejection: rejection reason is written to SamplesTable.qcRejectionReason
 *               and a notification is sent to the BP per their notification settings.
 */
export const ShipmentsTable = pgTable(
  "shipments",
  {
    id:              uuid("id").defaultRandom().primaryKey().notNull(),

    /**
     * Auto-generated shipment reference. e.g. "SH23042600001"
     */
    shipmentNo:      text("shipment_no").notNull(),

    vendorId:        uuid("vendor_id").notNull(),
    createdBy:       uuid("created_by").notNull(),

    status:          ShipmentStatus("status").default("CREATED").notNull(),

    // --- Courier details ---
    courierService:  text("courier_service"),
    courierNumber:   text("courier_number"),
    courierDate:     timestamp("courier_date", { mode: "date" }),

    // --- Lab receipt ---
    receivedBy:      uuid("received_by"),            // NMC ADMIN who received it
    receivedAt:      timestamp("received_at", { mode: "date" }),

    notes:           text("notes"),

    createdAt:       timestamp("created_at").defaultNow().notNull(),
    updatedAt:       timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("shipments_shipment_no_key").on(t.shipmentNo),
    index("shipments_vendor_idx").on(t.vendorId),
    index("shipments_status_idx").on(t.status),
    index("shipments_courier_idx").on(t.courierNumber),
  ]
);

export type Shipment    = InferSelectModel<typeof ShipmentsTable>;
export type NewShipment = InferInsertModel<typeof ShipmentsTable>;

/**
 * Junction table: one shipment → many samples.
 * Tracks per-sample acceptance/rejection within a shipment.
 */
export const ShipmentSamplesTable = pgTable(
  "shipment_samples",
  {
    id:           uuid("id").defaultRandom().primaryKey().notNull(),
    shipmentId:   uuid("shipment_id").notNull(),   // References ShipmentsTable.id
    sampleId:     uuid("sample_id").notNull(),     // References SamplesTable.id

    // Per-sample QC decision within this shipment
    accepted:     boolean("accepted"),             // NULL = not yet reviewed
    rejectionReason: text("rejection_reason"),
    reviewedBy:   uuid("reviewed_by"),             // ADMIN who accepted/rejected
    reviewedAt:   timestamp("reviewed_at", { mode: "date" }),
  },
  (t) => [
    uniqueIndex("shipment_samples_key").on(t.shipmentId, t.sampleId),
    index("shipment_samples_shipment_idx").on(t.shipmentId),
    index("shipment_samples_sample_idx").on(t.sampleId),
  ]
);

export type ShipmentSample    = InferSelectModel<typeof ShipmentSamplesTable>;
export type NewShipmentSample = InferInsertModel<typeof ShipmentSamplesTable>;

// =============================================================================
// INVOICES
// =============================================================================

/**
 * NeoTech raises invoices against vendors.
 * Can be per-order or per billing period.
 */
export const InvoicesTable = pgTable(
  "invoices",
  {
    id:          uuid("id").defaultRandom().primaryKey().notNull(),
    invoiceNo:   text("invoice_no").notNull(),
    vendorId:    uuid("vendor_id").notNull(),
    orderId:     uuid("order_id"),               // NULL for period-based invoices

    amount:      numeric("amount",       { precision: 10, scale: 2 }).notNull(),
    tax:         numeric("tax",          { precision: 10, scale: 2 }).default("0").notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency:    text("currency").default("INR").notNull(),

    status:      PaymentStatus("status").default("PENDING").notNull(),

    issuedAt:    timestamp("issued_at",  { mode: "date" }).defaultNow().notNull(),
    dueAt:       timestamp("due_at",     { mode: "date" }),
    paidAt:      timestamp("paid_at",    { mode: "date" }),

    notes:       text("notes"),
    createdAt:   timestamp("created_at").defaultNow().notNull(),
    updatedAt:   timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("invoices_invoice_no_key").on(t.invoiceNo),
    index("invoices_vendor_idx").on(t.vendorId),
    index("invoices_status_idx").on(t.status),
  ]
);

export type Invoice    = InferSelectModel<typeof InvoicesTable>;
export type NewInvoice = InferInsertModel<typeof InvoicesTable>;

// =============================================================================
// HELPDESK
// =============================================================================

/**
 * Support tickets raised by BUSINESS_PARTNER users or NMC staff.
 * BP users can see only their own tickets.
 * ADMIN / SUPER_ADMIN can see all tickets and respond.
 */
export const HelpdeskTable = pgTable(
  "helpdesk",
  {
    id:         uuid("id").defaultRandom().primaryKey().notNull(),
    vendorId:   uuid("vendor_id"),                  // NULL if raised by NMC staff internally
    raisedBy:   uuid("raised_by").notNull(),

    subject:    text("subject").notNull(),
    body:       text("body").notNull(),
    status:     TicketStatus("status").default("OPEN").notNull(),
    priority:   TicketPriority("priority").default("MEDIUM").notNull(),

    assignedTo: uuid("assigned_to"),                // NMC ADMIN assigned to this ticket

    resolvedAt: timestamp("resolved_at", { mode: "date" }),
    closedAt:   timestamp("closed_at",   { mode: "date" }),

    createdAt:  timestamp("created_at").defaultNow().notNull(),
    updatedAt:  timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("helpdesk_vendor_idx").on(t.vendorId),
    index("helpdesk_status_idx").on(t.status),
    index("helpdesk_assigned_idx").on(t.assignedTo),
  ]
);

export type Ticket    = InferSelectModel<typeof HelpdeskTable>;
export type NewTicket = InferInsertModel<typeof HelpdeskTable>;

export const TicketRepliesTable = pgTable(
  "ticket_replies",
  {
    id:        uuid("id").defaultRandom().primaryKey().notNull(),
    ticketId:  uuid("ticket_id").notNull(),
    authorId:  uuid("author_id").notNull(),
    body:      text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("ticket_replies_ticket_idx").on(t.ticketId),
    index("ticket_replies_author_idx").on(t.authorId),
  ]
);

export type TicketReply    = InferSelectModel<typeof TicketRepliesTable>;
export type NewTicketReply = InferInsertModel<typeof TicketRepliesTable>;

// =============================================================================
// AUDIT LOG
// =============================================================================

/**
 * Append-only audit trail for all write operations.
 * Per workflow: all admin, QC, and data entry actions must be logged
 * with actor, timestamp, and before/after snapshots.
 * Never updated or deleted.
 */
export const AuditLogTable = pgTable(
  "audit_log",
  {
    id:        uuid("id").defaultRandom().primaryKey().notNull(),
    actorId:   uuid("actor_id").notNull(),   // User who performed the action
    vendorId:  uuid("vendor_id"),            // Vendor context if applicable

    // e.g. "SAMPLE_STATUS_UPDATED", "PATIENT_EDITED", "REPORT_RELEASED",
    //      "VENDOR_APPROVED", "QC_REJECTED"
    action:    text("action").notNull(),

    entity:    text("entity").notNull(),     // Table name e.g. "samples", "patients"
    entityId:  text("entity_id"),            // Row affected (text to support both uuid and text PKs)

    before:    jsonb("before"),              // Previous state snapshot
    after:     jsonb("after"),               // New state snapshot

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    note:      text("note"),                 // Free-text reason (e.g. why a field was edited)

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("audit_log_actor_idx").on(t.actorId),
    index("audit_log_vendor_idx").on(t.vendorId),
    index("audit_log_entity_idx").on(t.entity, t.entityId),
    index("audit_log_action_idx").on(t.action),
    index("audit_log_created_at_idx").on(t.createdAt),
  ]
);

export type AuditLog    = InferSelectModel<typeof AuditLogTable>;
export type NewAuditLog = InferInsertModel<typeof AuditLogTable>;

// =============================================================================
// DRIZZLE RELATIONS
// =============================================================================

export const usersRelations = relations(UsersTable, ({ one, many }) => ({
  vendor:         one(VendorsTable,  { fields: [UsersTable.vendorId],  references: [VendorsTable.id] }),
  patients:       many(PatientsTable),
  orders:         many(OrdersTable),
  samples:        many(SamplesTable),
  tickets:        many(HelpdeskTable),
  ticketReplies:  many(TicketRepliesTable),
}));

export const vendorsRelations = relations(VendorsTable, ({ one, many }) => ({
  users:          many(UsersTable),
  settings:       one(VendorSettingsTable, { fields: [VendorsTable.id], references: [VendorSettingsTable.vendorId] }),
  patients:       many(PatientsTable),
  orders:         many(OrdersTable),
  samples:        many(SamplesTable),
  shipments:      many(ShipmentsTable),
  invoices:       many(InvoicesTable),
  pricelist:      many(PricelistTable),
  tickets:        many(HelpdeskTable),
}));

export const vendorSettingsRelations = relations(VendorSettingsTable, ({ one }) => ({
  vendor: one(VendorsTable, { fields: [VendorSettingsTable.vendorId], references: [VendorsTable.id] }),
}));

export const testCatalogRelations = relations(TestCatalogTable, ({ one, many }) => ({
  parent:    one(TestCatalogTable, { fields: [TestCatalogTable.parentTestId], references: [TestCatalogTable.id] }),
  children:  many(TestCatalogTable),
  samples:   many(SamplesTable),
  pricelist: many(PricelistTable),
}));

export const pricelistRelations = relations(PricelistTable, ({ one }) => ({
  test:   one(TestCatalogTable, { fields: [PricelistTable.testCatalogId], references: [TestCatalogTable.id] }),
  vendor: one(VendorsTable,     { fields: [PricelistTable.vendorId],      references: [VendorsTable.id] }),
}));

export const patientsRelations = relations(PatientsTable, ({ one, many }) => ({
  vendor:    one(VendorsTable, { fields: [PatientsTable.vendorId],  references: [VendorsTable.id] }),
  createdBy: one(UsersTable,   { fields: [PatientsTable.createdBy], references: [UsersTable.id] }),
  orders:    many(OrdersTable),
  samples:   many(SamplesTable),
}));

export const ordersRelations = relations(OrdersTable, ({ one, many }) => ({
  vendor:     one(VendorsTable,   { fields: [OrdersTable.vendorId],   references: [VendorsTable.id] }),
  patient:    one(PatientsTable,  { fields: [OrdersTable.patientId],  references: [PatientsTable.id] }),
  createdBy:  one(UsersTable,     { fields: [OrdersTable.createdBy],  references: [UsersTable.id] }),
  samples:    many(SamplesTable),
  invoices:   many(InvoicesTable),
}));

export const samplesRelations = relations(SamplesTable, ({ one, many }) => ({
  order:        one(OrdersTable,      { fields: [SamplesTable.orderId],       references: [OrdersTable.id] }),
  vendor:       one(VendorsTable,     { fields: [SamplesTable.vendorId],      references: [VendorsTable.id] }),
  patient:      one(PatientsTable,    { fields: [SamplesTable.patientId],     references: [PatientsTable.id] }),
  testCatalog:  one(TestCatalogTable, { fields: [SamplesTable.testCatalogId], references: [TestCatalogTable.id] }),
  createdBy:    one(UsersTable,       { fields: [SamplesTable.createdBy],     references: [UsersTable.id] }),
  shipments:    many(ShipmentSamplesTable),
}));

export const shipmentsRelations = relations(ShipmentsTable, ({ one, many }) => ({
  vendor:     one(VendorsTable, { fields: [ShipmentsTable.vendorId],    references: [VendorsTable.id] }),
  createdBy:  one(UsersTable,   { fields: [ShipmentsTable.createdBy],   references: [UsersTable.id] }),
  receivedBy: one(UsersTable,   { fields: [ShipmentsTable.receivedBy],  references: [UsersTable.id] }),
  samples:    many(ShipmentSamplesTable),
}));

export const shipmentSamplesRelations = relations(ShipmentSamplesTable, ({ one }) => ({
  shipment:   one(ShipmentsTable, { fields: [ShipmentSamplesTable.shipmentId], references: [ShipmentsTable.id] }),
  sample:     one(SamplesTable,   { fields: [ShipmentSamplesTable.sampleId],   references: [SamplesTable.id] }),
  reviewedBy: one(UsersTable,     { fields: [ShipmentSamplesTable.reviewedBy], references: [UsersTable.id] }),
}));

export const invoicesRelations = relations(InvoicesTable, ({ one }) => ({
  vendor: one(VendorsTable, { fields: [InvoicesTable.vendorId], references: [VendorsTable.id] }),
  order:  one(OrdersTable,  { fields: [InvoicesTable.orderId],  references: [OrdersTable.id] }),
}));

export const helpdeskRelations = relations(HelpdeskTable, ({ one, many }) => ({
  vendor:     one(VendorsTable, { fields: [HelpdeskTable.vendorId],    references: [VendorsTable.id] }),
  raisedBy:   one(UsersTable,   { fields: [HelpdeskTable.raisedBy],    references: [UsersTable.id] }),
  assignedTo: one(UsersTable,   { fields: [HelpdeskTable.assignedTo],  references: [UsersTable.id] }),
  replies:    many(TicketRepliesTable),
}));

export const ticketRepliesRelations = relations(TicketRepliesTable, ({ one }) => ({
  ticket: one(HelpdeskTable, { fields: [TicketRepliesTable.ticketId], references: [HelpdeskTable.id] }),
  author: one(UsersTable,    { fields: [TicketRepliesTable.authorId], references: [UsersTable.id] }),
}));