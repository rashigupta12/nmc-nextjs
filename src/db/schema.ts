// =============================================================================
// FILE: db/schema/index.ts
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

export const UserRole = pgEnum("user_role", [
  "SUPER_ADMIN",
  "ADMIN",
]);

export const VendorStatus = pgEnum("vendor_status", [
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
]);

export const SampleType = pgEnum("sample_type", [
  "SALIVA",
  "BLOOD",
  "TISSUE",
]);

export const SampleStatus = pgEnum("sample_status", [
  "CREATED",
  "SHIPPED",
  "RECEIVED",
  "QC_PASSED",
  "QC_FAILED",
  "PROCESSING",
  "READY",
  "REPORT_GENERATED",
  "RELEASED",
  "RESAMPLING",
]);

export const ShipmentStatus = pgEnum("shipment_status", [
  "CREATED",
  "COURIERED",
  "IN_TRANSIT",
  "RECEIVED",
  "PARTIALLY_RECEIVED",
]);

export const PaymentStatus = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

export const TicketStatus = pgEnum("ticket_status", [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export const TicketPriority = pgEnum("ticket_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const Deliverable = pgEnum("deliverable", [
  "REPORT",
  "RAW_DATA",
  "BOTH",
]);

export const NotifyTarget = pgEnum("notify_target", [
  "SUBJECT",
  "BUSINESS_PARTNER",
  "BOTH",
]);

export const GenderEnum = pgEnum("gender", ["M", "F", "Other"]);
export const SmokingEnum = pgEnum("smoking", ["Yes", "No", "Occasional"]);
export const YesNoEnum = pgEnum("yes_no", ["yes", "no"]);
export const LifestyleEnum = pgEnum("lifestyle", [
  "No Activity",
  "Light Activity",
  "Moderate Activity",
  "Very Active",
  "Extremely Active",
]);

// =============================================================================
// TYPE INTERFACES FOR JSONB FIELDS
// =============================================================================

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface FamilyHistoryDetail {
  condition: string;
  relationship: string;
}

export interface ReferringDoctor {
  name: string;
  hospital: string;
  clinic: string;
  mobileNo: string;
  email: string;
}

export interface ValidationSummary {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  columnCount: number;
}

export interface NotificationEvent {
  event: string;
  email: boolean;
  sms: boolean;
}

// =============================================================================
// USERS TABLE (NMC Staff Only)
// =============================================================================

export const UsersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    role: UserRole("role").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    mobile: text("mobile"),
    isActive: boolean("is_active").default(true).notNull(),
    isPasswordReset: boolean("is_password_reset").default(false).notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    lastLoginAt: timestamp("last_login_at", { mode: "date" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_email_key").on(t.email),
    index("users_role_idx").on(t.role),
    index("users_active_idx").on(t.isActive),
  ]
);

// =============================================================================
// AUTH TOKENS TABLES
// =============================================================================

export const EmailVerificationTokenTable = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
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
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (t) => [
    uniqueIndex("prt_email_token_key").on(t.email, t.token),
    uniqueIndex("prt_token_key").on(t.token),
  ]
);

// =============================================================================
// VENDORS TABLE (Business Partners)
// =============================================================================

export const VendorsTable = pgTable(
  "vendors",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    vendorCode: text("vendor_code").notNull().unique(),
    status: VendorStatus("status").default("ACTIVE").notNull(),
    name: text("name").notNull(),
    contactNo: text("contact_no").notNull(),
    gender: text("gender").notNull(),
    costCentreNo: text("cost_centre_no"),
    mrNo: text("mr_no"),
    email: text("email").notNull(),
    password: text("password").notNull(),
    logo: text("logo"),
    remark: text("remark"),
    loginurl: text("loginurl").notNull(),
    loginSlug: text("login_slug").notNull().unique(),
    addedBy: uuid("added_by").notNull(),
    isPasswordReset: boolean("is_password_reset").default(false).notNull(),
    lastLoginAt: timestamp("last_login_at", { mode: "date" }),
    address: text("address").notNull(),
    cinNumber: text("cin_number"),
    vatNumber: text("vat_number"),
    gstNumber: text("gst_number"),
    city: text("city"),
    state: text("state"),
    country: text("country"),
    zipCode: text("zip_code"),
    website: text("website"),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("vendors_status_idx").on(t.status),
    index("vendors_email_idx").on(t.email),
    index("vendors_name_idx").on(t.name),
    index("vendors_code_idx").on(t.vendorCode),
    index("vendors_login_slug_idx").on(t.loginSlug),
  ]
);

// =============================================================================
// VENDOR AUTH TOKENS
// =============================================================================

export const VendorPasswordResetTokenTable = pgTable(
  "vendor_password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    vendorId: uuid("vendor_id").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (t) => [
    uniqueIndex("vprt_vendor_token_key").on(t.vendorId, t.token),
    uniqueIndex("vprt_token_key").on(t.token),
  ]
);

// =============================================================================
// VENDOR SETTINGS TABLE
// =============================================================================

export const VendorSettingsTable = pgTable(
  "vendor_settings",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    vendorId: uuid("vendor_id").notNull().unique(),
    deliverable: Deliverable("deliverable").default("REPORT").notNull(),
    s3BucketName: text("s3_bucket_name"),
    rawDataEmail: text("raw_data_email"),
    hidePersonalInfo: boolean("hide_personal_info").default(false).notNull(),
    passwordProtectedReport: boolean("password_protected_report").default(false).notNull(),
    passwordRule: text("password_rule").default("NAME4_DOB").notNull(),
    logoImg: text("logo_img"),
    coverLogoImgName: text("cover_logo_img_name"),
    coverPage: boolean("cover_page").default(false).notNull(),
    skinCoverBackPage: boolean("skin_cover_back_page").default(false).notNull(),
    blankPage: boolean("blank_page").default(false).notNull(),
    sectionImages: boolean("section_images").default(false).notNull(),
    summaryPages: boolean("summary_pages").default(false).notNull(),
    splitWellnessReport: boolean("split_wellness_report").default(false).notNull(),
    coverPageImgName: text("cover_page_img_name"),
    backCoverPageImgName: text("back_cover_page_img_name"),
    welcomeMessage: text("welcome_message"),
    about: text("about"),
    aboutImgName: text("about_img_name"),
    legalDisContent: text("legal_dis_content"),
    sigTitle: text("sig_title"),
    sigName: text("sig_name"),
    sigImgName: text("sig_img_name"),
    aboutThemeColor: text("about_theme_color"),
    aboutTextColor: text("about_text_color"),
    testThemeColor: text("test_theme_color"),
    testTextColor: text("test_text_color"),
    fitnessThemeColor: text("fitness_theme_color"),
    fitnessTextColor: text("fitness_text_color"),
    weightThemeColor: text("weight_theme_color"),
    weightTextColor: text("weight_text_color"),
    detoxThemeColor: text("detox_theme_color"),
    detoxTextColor: text("detox_text_color"),
    cardiometThemeColor: text("cardiomet_theme_color"),
    cardiometTextColor: text("cardiomet_text_color"),
    dietPage1Img: text("diet_page1_img"),
    dietPage2Img: text("diet_page2_img"),
    fitnessPage1Img: text("fitness_page1_img"),
    fitnessPage2Img: text("fitness_page2_img"),
    weightPage1Img: text("weight_page1_img"),
    weightPage2Img: text("weight_page2_img"),
    detoxPage1Img: text("detox_page1_img"),
    detoxPage2Img: text("detox_page2_img"),
    imageOverview: text("image_overview"),
    skinCoverPageImg: text("skin_cover_page_img"),
    skinBackCoverPageImg: text("skin_back_cover_page_img"),
    cardiometPagesLogo: boolean("cardiomet_pages_logo").default(false).notNull(),
    cardiometBackCoverPage: text("cardiomet_back_cover_page"),
    cardiometCoverPageLogo: boolean("cardiomet_cover_page_logo").default(false).notNull(),
    immunityCoverPage: text("immunity_cover_page"),
    immunityBackCoverPage: text("immunity_back_cover_page"),
    immunityBackCoverPageLogo: boolean("immunity_back_cover_page_logo").default(false).notNull(),
    immunityCoverPageLogo: boolean("immunity_cover_page_logo").default(false).notNull(),
    autoimmuneCoverPage: text("autoimmune_cover_page"),
    autoimmuneBackCoverPage: text("autoimmune_back_cover_page"),
    autoimmuneBackCoverPageLogo: boolean("autoimmune_back_cover_page_logo").default(false).notNull(),
    autoimmuneCoverPageLogo: boolean("autoimmune_cover_page_logo").default(false).notNull(),
    womanCoverPage: text("woman_cover_page"),
    womanBackCoverPage: text("woman_back_cover_page"),
    womanBackCoverPageLogo: boolean("woman_back_cover_page_logo").default(false).notNull(),
    womanCoverPageLogo: boolean("woman_cover_page_logo").default(false).notNull(),
    menCoverPage: text("men_cover_page"),
    menBackCoverPage: text("men_back_cover_page"),
    menBackCoverPageLogo: boolean("men_back_cover_page_logo").default(false).notNull(),
    menCoverPageLogo: boolean("men_cover_page_logo").default(false).notNull(),
    eyeCoverPage: text("eye_cover_page"),
    eyeBackCoverPage: text("eye_back_cover_page"),
    eyeBackCoverPageLogo: boolean("eye_back_cover_page_logo").default(false).notNull(),
    eyeCoverPageLogo: boolean("eye_cover_page_logo").default(false).notNull(),
    kidneyCoverPage: text("kidney_cover_page"),
    kidneyBackCoverPage: text("kidney_back_cover_page"),
    kidneyBackCoverPageLogo: boolean("kidney_back_cover_page_logo").default(false).notNull(),
    kidneyCoverPageLogo: boolean("kidney_cover_page_logo").default(false).notNull(),
    sleepCoverPage: text("sleep_cover_page"),
    sleepBackCoverPage: text("sleep_back_cover_page"),
    sleepBackCoverPageLogo: boolean("sleep_back_cover_page_logo").default(false).notNull(),
    sleepCoverPageLogo: boolean("sleep_cover_page_logo").default(false).notNull(),
    vendorAddress: text("vendor_address"),
    notifyTarget: NotifyTarget("notify_target").default("BOTH").notNull(),
    notificationEvents: jsonb("notification_events"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("vendor_settings_vendor_idx").on(t.vendorId),
  ]
);

// =============================================================================
// VENDOR ETHNICITY MASTER TABLE
// =============================================================================

export const VendorEthnicityMasterTable = pgTable(
  "vendor_ethnicity_master",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    ethnicity: text("ethnicity").notNull(),
    vendorId: uuid("vendor_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("vendor_ethnicity_unique").on(t.vendorId, t.ethnicity),
    index("vendor_ethnicity_vendor_idx").on(t.vendorId),
    index("vendor_ethnicity_name_idx").on(t.ethnicity),
  ]
);

// =============================================================================
// VENDOR HOSPITAL MASTER TABLE
// =============================================================================

export const VendorHospitalMasterTable = pgTable(
  "vendor_hospital_master",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    hospital: text("hospital").notNull(),
    vendorId: uuid("vendor_id").notNull(),
    address: text("address").notNull(),
    contactNo: text("contact_no").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("vendor_hospital_unique").on(t.vendorId, t.hospital),
    index("vendor_hospital_vendor_idx").on(t.vendorId),
    index("vendor_hospital_name_idx").on(t.hospital),
  ]
);

// =============================================================================
// TEST CATALOG TABLE (Existing - No Changes)
// =============================================================================

export const TestCatalogTable = pgTable(
  "test_catalog",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    testCode: text("test_code").notNull(),
    testName: text("test_name").notNull(),
    alias: text("alias"),
    description: text("description"),
    parentTestId: uuid("parent_test_id"),
    subParentOf: uuid("sub_parent_of"),
    tatDays: integer("tat_days").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("test_catalog_code_key").on(t.testCode),
    index("test_catalog_parent_idx").on(t.parentTestId),
    index("test_catalog_active_idx").on(t.isActive),
  ]
);

// =============================================================================
// PRICELIST TABLE (Vendor Price Overrides)
// =============================================================================

export const PricelistTable = pgTable(
  "pricelist",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    testCatalogId: uuid("test_catalog_id").notNull(),
    vendorId: uuid("vendor_id").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("INR").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    effectiveFrom: timestamp("effective_from", { mode: "date" }).defaultNow().notNull(),
    effectiveTo: timestamp("effective_to", { mode: "date" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("pricelist_test_vendor_key").on(t.testCatalogId, t.vendorId),
    index("pricelist_vendor_idx").on(t.vendorId),
  ]
);

// =============================================================================
// PATIENTS TABLE (Existing - No Changes)
// =============================================================================

export const PatientsTable = pgTable(
  "patients",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    patientId: text("patient_id").notNull(),
    vendorId: uuid("vendor_id").notNull(),
    createdBy: uuid("created_by").notNull(),

    // Doctor Information
    doctorFName: text("doctor_f_name").notNull(),
    doctorLName: text("doctor_l_name"),
    hospitalName: text("hospital_name").notNull(),
    clinic: text("clinic").notNull(),
    docMobileNo: text("doc_mobile_no"),
    docEmail: text("doc_email"),

    // Patient Personal Information
    patientFName: text("patient_f_name").notNull(),
    patientMName: text("patient_m_name"),
    patientLName: text("patient_l_name").notNull(),
    gender: GenderEnum("gender").notNull(),
    dob: text("dob").notNull(),
    age: text("age").notNull(),
    height: text("height").notNull(),
    weight: text("weight").notNull(),

    // Address Information
    address: jsonb("address").notNull(),

    // Contact Information
    phoneNo: text("phone_no"),
    mobileNo: text("mobile_no"),
    email: text("email").notNull(),

    // Demographic Information
    nationality: text("nationality"),
    ethinicity: text("ethinicity").notNull(),
    lifestyle: LifestyleEnum("lifestyle").notNull(),

    // Medical Information
    patientHistory: text("patient_history"),
    medication: text("medication"),
    familyHistory: text("family_history"),
    familyHistoryDetails: jsonb("family_history_details"),
    isPatientConsent: integer("is_patient_consent").notNull(),
    pdf_file_name: text("pdf_file_name"),
    is_pdf_uploaded: integer("is_pdf_uploaded").default(0),
    mrno: text("mr_no"),
    TRF: text("trf"),
    tag: text("tag"),

    // Lifestyle and Health Metrics
    smoking: SmokingEnum("smoking").notNull(),
    alcoholic: integer("alcoholic").default(0),
    medicalHistory: text("medical_history"),
    medication2: text("medication_2"),
    familyHistory1: text("family_history_1"),
    relationship: text("relationship"),

    // Cardiovascular Health
    chestPain: YesNoEnum("chest_pain").notNull(),
    cardiacEnzyme: YesNoEnum("cardiac_enzyme").notNull(),

    // Lipid Profile
    cholestrol: text("cholestrol"),
    hdl: text("hdl"),
    cholestrolHdlRatio: text("cholestrol_hdl_ratio"),
    ldl: text("ldl"),
    hdl_ldlRatio: text("hdl_ldl_ratio"),
    triglycerides: text("triglycerides"),

    // Blood Health
    hbValue: text("hb_value"),

    // Vital Signs
    bp_systolic: text("bp_systolic"),
    bp_diastolic: text("bp_diastolic"),

    // Medications and Reports
    medications: text("medications"),
    echocardiography: text("echocardiography"),
    nct: text("nct"),
    metabolomeRatio: text("metabolome_ratio"),

    // System Metadata
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("patients_patient_id_key").on(t.patientId),
    uniqueIndex("patients_email_key").on(t.email),
    index("patients_vendor_idx").on(t.vendorId),
    index("patients_patient_name_idx").on(t.patientFName, t.patientLName),
    index("patients_gender_idx").on(t.gender),
    index("patients_dob_idx").on(t.dob),
    index("patients_mrno_idx").on(t.mrno),
    index("patients_created_at_idx").on(t.createdAt),
    index("patients_smoking_idx").on(t.smoking),
    index("patients_chest_pain_idx").on(t.chestPain),
    index("patients_cardiac_enzyme_idx").on(t.cardiacEnzyme),
  ]
);

// =============================================================================
// ORDERS TABLE (UPDATED for API workflow)
// =============================================================================

export const OrdersTable = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    orderNo: text("order_no").notNull().unique(),
    vendorId: uuid("vendor_id").notNull(),
    patientId: uuid("patient_id").notNull(),
    createdBy: uuid("created_by").notNull(),
    
    // NEW: For API workflow - can be null initially
    sampleId: uuid("sample_id"),
    
    // NEW: Fields from API
    addedBy: text("added_by").notNull(),
    shipmentStatus: text("shipment_status").notNull().default("Pending"),
    orderDate: text("order_date").notNull(), // Changed from timestamp to text for YYYY-MM-DD
    statusCode: text("status_code").notNull().default("O001"),
    remark: text("remark").default(""),
    
    // Existing fields (kept for compatibility)
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }),
    currency: text("currency").default("INR").notNull(),
    paymentStatus: PaymentStatus("payment_status").default("PENDING").notNull(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("orders_order_no_key").on(t.orderNo),
    index("orders_vendor_idx").on(t.vendorId),
    index("orders_patient_idx").on(t.patientId),
    index("orders_sample_idx").on(t.sampleId), // NEW index
    index("orders_date_idx").on(t.orderDate),
    index("orders_payment_status_idx").on(t.paymentStatus),
    index("orders_status_code_idx").on(t.statusCode), // NEW index
    index("orders_shipment_status_idx").on(t.shipmentStatus), // NEW index
  ]
);

// =============================================================================
// SAMPLES TABLE (UPDATED for API workflow)
// =============================================================================

export const SamplesTable = pgTable(
  "samples",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    sampleId: text("sample_id").notNull().unique(),
    nmcgId: text("nmcg_id"),
    partnerSampleId: text("partner_sample_id"),
    orderId: uuid("order_id").notNull(),
    vendorId: uuid("vendor_id").notNull(),
    patientId: uuid("patient_id").notNull(),
    testCatalogId: uuid("test_catalog_id").notNull(),
    createdBy: uuid("created_by").notNull(),
    sampleType: SampleType("sample_type").notNull(),
    
    // NEW/Modified fields for API
    kitBarcode: text("kit_barcode").default(""),
    trfUrl: text("trf_url"),
    dateSampleTaken: text("date_sample_taken"), // Changed from timestamp to text
    sampleTime: text("sample_time").default("12:00:00"), // NEW field
    referringDoctor: jsonb("referring_doctor"),
    
    // NEW fields for API
    subtests: text("subtests").array().default([]),
    addedBy: text("added_by").notNull(),
    vendorSampleId: text("vendor_sample_id").default(""),
    tatDueAt: text("tat_due_at"), // Changed from timestamp to text
    
    // Existing fields
    status: SampleStatus("status").default("CREATED").notNull(),
    qcRejectionReason: text("qc_rejection_reason"),
    shippedAt: timestamp("shipped_at", { mode: "date" }),
    receivedAt: timestamp("received_at", { mode: "date" }),
    qcPassedAt: timestamp("qc_passed_at", { mode: "date" }),
    processedAt: timestamp("processed_at", { mode: "date" }),
    reportGeneratedAt: timestamp("report_generated_at", { mode: "date" }),
    releasedAt: timestamp("released_at", { mode: "date" }),
    
    // Genetic data fields
    csvUploaded: boolean("csv_uploaded").default(false).notNull(),
    csvValidated: boolean("csv_validated").default(false).notNull(),
    validationSummary: jsonb("validation_summary"),
    pdfPath: text("pdf_path"),
    mongoReportId: text("mongo_report_id"),
    reportGenerated: boolean("report_generated").default(false).notNull(),
    reportReleased: boolean("report_released").default(false).notNull(),
    reportPasswordProtected: boolean("report_password_protected").default(false).notNull(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
    index("samples_added_by_idx").on(t.addedBy), // NEW index
    index("samples_date_taken_idx").on(t.dateSampleTaken), // NEW index
  ]
);

// =============================================================================
// SHIPMENTS TABLE
// =============================================================================

export const ShipmentsTable = pgTable(
  "shipments",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    shipmentNo: text("shipment_no").notNull(),
    vendorId: uuid("vendor_id").notNull(),
    createdBy: uuid("created_by").notNull(),
    status: ShipmentStatus("status").default("CREATED").notNull(),
    courierService: text("courier_service"),
    courierNumber: text("courier_number"),
    courierDate: timestamp("courier_date", { mode: "date" }),
    receivedBy: uuid("received_by"),
    receivedAt: timestamp("received_at", { mode: "date" }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("shipments_shipment_no_key").on(t.shipmentNo),
    index("shipments_vendor_idx").on(t.vendorId),
    index("shipments_status_idx").on(t.status),
    index("shipments_courier_idx").on(t.courierNumber),
  ]
);

// =============================================================================
// SHIPMENT SAMPLES JUNCTION TABLE
// =============================================================================

export const ShipmentSamplesTable = pgTable(
  "shipment_samples",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    shipmentId: uuid("shipment_id").notNull(),
    sampleId: uuid("sample_id").notNull(),
    accepted: boolean("accepted"),
    rejectionReason: text("rejection_reason"),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  },
  (t) => [
    uniqueIndex("shipment_samples_key").on(t.shipmentId, t.sampleId),
    index("shipment_samples_shipment_idx").on(t.shipmentId),
    index("shipment_samples_sample_idx").on(t.sampleId),
  ]
);

// =============================================================================
// INVOICES TABLE
// =============================================================================

export const InvoicesTable = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    invoiceNo: text("invoice_no").notNull(),
    vendorId: uuid("vendor_id").notNull(),
    orderId: uuid("order_id"),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 10, scale: 2 }).default("0").notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("INR").notNull(),
    status: PaymentStatus("status").default("PENDING").notNull(),
    issuedAt: timestamp("issued_at", { mode: "date" }).defaultNow().notNull(),
    dueAt: timestamp("due_at", { mode: "date" }),
    paidAt: timestamp("paid_at", { mode: "date" }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("invoices_invoice_no_key").on(t.invoiceNo),
    index("invoices_vendor_idx").on(t.vendorId),
    index("invoices_status_idx").on(t.status),
  ]
);

// =============================================================================
// HELPDESK TICKETS TABLE
// =============================================================================

export const HelpdeskTable = pgTable(
  "helpdesk",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    vendorId: uuid("vendor_id"),
    raisedBy: uuid("raised_by").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    status: TicketStatus("status").default("OPEN").notNull(),
    priority: TicketPriority("priority").default("MEDIUM").notNull(),
    assignedTo: uuid("assigned_to"),
    resolvedAt: timestamp("resolved_at", { mode: "date" }),
    closedAt: timestamp("closed_at", { mode: "date" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("helpdesk_vendor_idx").on(t.vendorId),
    index("helpdesk_status_idx").on(t.status),
    index("helpdesk_assigned_idx").on(t.assignedTo),
  ]
);

// =============================================================================
// TICKET REPLIES TABLE
// =============================================================================

export const TicketRepliesTable = pgTable(
  "ticket_replies",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    ticketId: uuid("ticket_id").notNull(),
    authorId: uuid("author_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("ticket_replies_ticket_idx").on(t.ticketId),
    index("ticket_replies_author_idx").on(t.authorId),
  ]
);

// =============================================================================
// AUDIT LOG TABLE
// =============================================================================

export const AuditLogTable = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    actorId: uuid("actor_id").notNull(),
    vendorId: uuid("vendor_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    note: text("note"),
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

// =============================================================================
// DRIZZLE RELATIONS (UPDATED)
// =============================================================================

export const usersRelations = relations(UsersTable, ({ many }) => ({
  patients: many(PatientsTable),
  orders: many(OrdersTable),
  samples: many(SamplesTable),
  tickets: many(HelpdeskTable),
  ticketReplies: many(TicketRepliesTable),
  createdVendors: many(VendorsTable),
  auditLogs: many(AuditLogTable),
}));

export const vendorsRelations = relations(VendorsTable, ({ one, many }) => ({
  settings: one(VendorSettingsTable, { 
    fields: [VendorsTable.id], 
    references: [VendorSettingsTable.vendorId] 
  }),
  ethnicities: many(VendorEthnicityMasterTable),
  hospitals: many(VendorHospitalMasterTable),
  patients: many(PatientsTable),
  orders: many(OrdersTable),
  samples: many(SamplesTable),
  shipments: many(ShipmentsTable),
  invoices: many(InvoicesTable),
  pricelist: many(PricelistTable),
  tickets: many(HelpdeskTable),
  addedByUser: one(UsersTable, { 
    fields: [VendorsTable.addedBy], 
    references: [UsersTable.id] 
  }),
  passwordResetTokens: many(VendorPasswordResetTokenTable),
  auditLogs: many(AuditLogTable),
}));

export const vendorSettingsRelations = relations(VendorSettingsTable, ({ one }) => ({
  vendor: one(VendorsTable, { 
    fields: [VendorSettingsTable.vendorId], 
    references: [VendorsTable.id] 
  }),
}));

export const vendorEthnicityRelations = relations(VendorEthnicityMasterTable, ({ one }) => ({
  vendor: one(VendorsTable, { 
    fields: [VendorEthnicityMasterTable.vendorId], 
    references: [VendorsTable.id] 
  }),
}));

export const vendorHospitalRelations = relations(VendorHospitalMasterTable, ({ one }) => ({
  vendor: one(VendorsTable, { 
    fields: [VendorHospitalMasterTable.vendorId], 
    references: [VendorsTable.id] 
  }),
}));

export const vendorPasswordResetTokenRelations = relations(VendorPasswordResetTokenTable, ({ one }) => ({
  vendor: one(VendorsTable, { 
    fields: [VendorPasswordResetTokenTable.vendorId], 
    references: [VendorsTable.id] 
  }),
}));

export const testCatalogRelations = relations(TestCatalogTable, ({ one, many }) => ({
  parent: one(TestCatalogTable, { 
    fields: [TestCatalogTable.parentTestId], 
    references: [TestCatalogTable.id] 
  }),
  children: many(TestCatalogTable),
  samples: many(SamplesTable),
  pricelist: many(PricelistTable),
}));

export const pricelistRelations = relations(PricelistTable, ({ one }) => ({
  test: one(TestCatalogTable, { 
    fields: [PricelistTable.testCatalogId], 
    references: [TestCatalogTable.id] 
  }),
  vendor: one(VendorsTable, { 
    fields: [PricelistTable.vendorId], 
    references: [VendorsTable.id] 
  }),
}));

export const patientsRelations = relations(PatientsTable, ({ one, many }) => ({
  vendor: one(VendorsTable, { 
    fields: [PatientsTable.vendorId], 
    references: [VendorsTable.id] 
  }),
  createdBy: one(UsersTable, { 
    fields: [PatientsTable.createdBy], 
    references: [UsersTable.id] 
  }),
  orders: many(OrdersTable),
  samples: many(SamplesTable),
}));

export const ordersRelations = relations(OrdersTable, ({ one, many }) => ({
  vendor: one(VendorsTable, { 
    fields: [OrdersTable.vendorId], 
    references: [VendorsTable.id] 
  }),
  patient: one(PatientsTable, { 
    fields: [OrdersTable.patientId], 
    references: [PatientsTable.id] 
  }),
  createdBy: one(UsersTable, { 
    fields: [OrdersTable.createdBy], 
    references: [UsersTable.id] 
  }),
  sample: one(SamplesTable, { // NEW relation
    fields: [OrdersTable.sampleId],
    references: [SamplesTable.id],
  }),
  samples: many(SamplesTable),
  invoices: many(InvoicesTable),
}));

export const samplesRelations = relations(SamplesTable, ({ one, many }) => ({
  order: one(OrdersTable, { 
    fields: [SamplesTable.orderId], 
    references: [OrdersTable.id] 
  }),
  vendor: one(VendorsTable, { 
    fields: [SamplesTable.vendorId], 
    references: [VendorsTable.id] 
  }),
  patient: one(PatientsTable, { 
    fields: [SamplesTable.patientId], 
    references: [PatientsTable.id] 
  }),
  testCatalog: one(TestCatalogTable, { 
    fields: [SamplesTable.testCatalogId], 
    references: [TestCatalogTable.id] 
  }),
  createdBy: one(UsersTable, { 
    fields: [SamplesTable.createdBy], 
    references: [UsersTable.id] 
  }),
  shipments: many(ShipmentSamplesTable),
}));

export const shipmentsRelations = relations(ShipmentsTable, ({ one, many }) => ({
  vendor: one(VendorsTable, { 
    fields: [ShipmentsTable.vendorId], 
    references: [VendorsTable.id] 
  }),
  createdBy: one(UsersTable, { 
    fields: [ShipmentsTable.createdBy], 
    references: [UsersTable.id] 
  }),
  receivedBy: one(UsersTable, { 
    fields: [ShipmentsTable.receivedBy], 
    references: [UsersTable.id] 
  }),
  samples: many(ShipmentSamplesTable),
}));

export const shipmentSamplesRelations = relations(ShipmentSamplesTable, ({ one }) => ({
  shipment: one(ShipmentsTable, { 
    fields: [ShipmentSamplesTable.shipmentId], 
    references: [ShipmentsTable.id] 
  }),
  sample: one(SamplesTable, { 
    fields: [ShipmentSamplesTable.sampleId], 
    references: [SamplesTable.id] 
  }),
  reviewedBy: one(UsersTable, { 
    fields: [ShipmentSamplesTable.reviewedBy], 
    references: [UsersTable.id] 
  }),
}));

export const invoicesRelations = relations(InvoicesTable, ({ one }) => ({
  vendor: one(VendorsTable, { 
    fields: [InvoicesTable.vendorId], 
    references: [VendorsTable.id] 
  }),
  order: one(OrdersTable, { 
    fields: [InvoicesTable.orderId], 
    references: [OrdersTable.id] 
  }),
}));

export const helpdeskRelations = relations(HelpdeskTable, ({ one, many }) => ({
  vendor: one(VendorsTable, { 
    fields: [HelpdeskTable.vendorId], 
    references: [VendorsTable.id] 
  }),
  raisedBy: one(UsersTable, { 
    fields: [HelpdeskTable.raisedBy], 
    references: [UsersTable.id] 
  }),
  assignedTo: one(UsersTable, { 
    fields: [HelpdeskTable.assignedTo], 
    references: [UsersTable.id] 
  }),
  replies: many(TicketRepliesTable),
}));

export const ticketRepliesRelations = relations(TicketRepliesTable, ({ one }) => ({
  ticket: one(HelpdeskTable, { 
    fields: [TicketRepliesTable.ticketId], 
    references: [HelpdeskTable.id] 
  }),
  author: one(UsersTable, { 
    fields: [TicketRepliesTable.authorId], 
    references: [UsersTable.id] 
  }),
}));

export const auditLogRelations = relations(AuditLogTable, ({ one }) => ({
  actor: one(UsersTable, { 
    fields: [AuditLogTable.actorId], 
    references: [UsersTable.id] 
  }),
  vendor: one(VendorsTable, { 
    fields: [AuditLogTable.vendorId], 
    references: [VendorsTable.id] 
  }),
}));

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type User = InferSelectModel<typeof UsersTable>;
export type NewUser = InferInsertModel<typeof UsersTable>;

export type Vendor = InferSelectModel<typeof VendorsTable>;
export type NewVendor = InferInsertModel<typeof VendorsTable>;

export type VendorSettings = InferSelectModel<typeof VendorSettingsTable>;
export type NewVendorSettings = InferInsertModel<typeof VendorSettingsTable>;

export type VendorEthnicity = InferSelectModel<typeof VendorEthnicityMasterTable>;
export type NewVendorEthnicity = InferInsertModel<typeof VendorEthnicityMasterTable>;

export type VendorHospital = InferSelectModel<typeof VendorHospitalMasterTable>;
export type NewVendorHospital = InferInsertModel<typeof VendorHospitalMasterTable>;

export type TestCatalog = InferSelectModel<typeof TestCatalogTable>;
export type NewTestCatalog = InferInsertModel<typeof TestCatalogTable>;

export type Pricelist = InferSelectModel<typeof PricelistTable>;
export type NewPricelist = InferInsertModel<typeof PricelistTable>;

export type Patient = InferSelectModel<typeof PatientsTable>;
export type NewPatient = InferInsertModel<typeof PatientsTable>;

export type Order = InferSelectModel<typeof OrdersTable>;
export type NewOrder = InferInsertModel<typeof OrdersTable>;

export type Sample = InferSelectModel<typeof SamplesTable>;
export type NewSample = InferInsertModel<typeof SamplesTable>;

export type Shipment = InferSelectModel<typeof ShipmentsTable>;
export type NewShipment = InferInsertModel<typeof ShipmentsTable>;

export type ShipmentSample = InferSelectModel<typeof ShipmentSamplesTable>;
export type NewShipmentSample = InferInsertModel<typeof ShipmentSamplesTable>;

export type Invoice = InferSelectModel<typeof InvoicesTable>;
export type NewInvoice = InferInsertModel<typeof InvoicesTable>;

export type Ticket = InferSelectModel<typeof HelpdeskTable>;
export type NewTicket = InferInsertModel<typeof HelpdeskTable>;

export type TicketReply = InferSelectModel<typeof TicketRepliesTable>;
export type NewTicketReply = InferInsertModel<typeof TicketRepliesTable>;

export type AuditLog = InferSelectModel<typeof AuditLogTable>;
export type NewAuditLog = InferInsertModel<typeof AuditLogTable>;

export type EmailVerificationToken = InferSelectModel<typeof EmailVerificationTokenTable>;
export type NewEmailVerificationToken = InferInsertModel<typeof EmailVerificationTokenTable>;

export type PasswordResetToken = InferSelectModel<typeof PasswordResetTokenTable>;
export type NewPasswordResetToken = InferInsertModel<typeof PasswordResetTokenTable>;

export type VendorPasswordResetToken = InferSelectModel<typeof VendorPasswordResetTokenTable>;
export type NewVendorPasswordResetToken = InferInsertModel<typeof VendorPasswordResetTokenTable>;