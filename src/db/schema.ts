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
 * System-wide user roles. Only 2 roles exist for NMC staff.
 * Vendors/Business Partners have their own separate login portal.
 */
export const UserRole = pgEnum("user_role", [
  "SUPER_ADMIN",       // Full platform access. Approves vendors, manages everything.
  "ADMIN",             // NeoTech ops staff. Test catalog, QC, data processing, reports.
]);

/**
 * Vendor registration/approval lifecycle.
 * Admin creates vendor, login URL is sent via email.
 */
export const VendorStatus = pgEnum("vendor_status", [
  "ACTIVE",    // Vendor can access their portal
  "SUSPENDED", // Temporarily disabled by SUPER_ADMIN
  "INACTIVE",  // Permanently disabled
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
// USERS (NMC Staff Only)
// =============================================================================

/**
 * NMC Staff users: SUPER_ADMIN and ADMIN only.
 * BUSINESS_PARTNER is NOT a user role — vendors have separate login portal.
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
    mobile:            text("mobile"),                   // Encrypted at app layer

    // Auth state
    isActive:         boolean("is_active").default(true).notNull(),
    isPasswordReset:  boolean("is_password_reset").default(false).notNull(),
    emailVerified:    timestamp("email_verified", { mode: "date" }),
    lastLoginAt:      timestamp("last_login_at", { mode: "date" }),

    createdAt:        timestamp("created_at").defaultNow().notNull(),
    updatedAt:        timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_email_key").on(t.email),
    index("users_role_idx").on(t.role),
  ]
);

export type User    = InferSelectModel<typeof UsersTable>;
export type NewUser = InferInsertModel<typeof UsersTable>;

// =============================================================================
// AUTH TOKENS (NMC Staff)
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
 * Creation flow:
 *   1. Admin creates vendor record with all details
 *   2. System generates unique vendorCode and temporary password
 *   3. Email with login URL and temporary password is sent to vendor email
 *   4. Vendor accesses separate login portal using the URL
 *   5. Vendor must change password on first login
 *   6. Vendor can update their settings after login
 */
export const VendorsTable = pgTable(
  "vendors",
  {
    id:             uuid("id").defaultRandom().primaryKey().notNull(),
    vendorCode:     text("vendor_code").notNull().unique(),  // Unique business identifier
    status:         VendorStatus("status").default("ACTIVE").notNull(),

    // Core identity
    name:           text("name").notNull(),
    contactNo:      text("contact_no").notNull(),            // Encrypted
    gender:         text("gender").notNull(),                // M/F/O

    costCentreNo:   text("cost_centre_no"),
    mrNo:           text("mr_no"),
    email:          text("email").notNull(),                 // Encrypted
    password:       text("password").notNull(),              // Hashed password for vendor portal login
    logo:           text("logo"),                            // URL to logo
    remark:         text("remark"),
    loginurl:       text("loginurl").notNull(),              // Unique login URL for vendor portal
    loginSlug:      text("login_slug").notNull().unique(),   // URL slug used in /vendor/login/[slug]
    
    addedBy:        uuid("added_by").notNull(),              // References UsersTable.id (ADMIN who created)

    // Auth state for vendor
    isPasswordReset:  boolean("is_password_reset").default(false).notNull(), // Must reset on first login
    lastLoginAt:      timestamp("last_login_at", { mode: "date" }),

    // --- Company-only fields ---
    address:        text("address").notNull(),               // Encrypted
    cinNumber:      text("cin_number"),
    vatNumber:      text("vat_number"),
    gstNumber:      text("gst_number"),
    city:           text("city"),
    state:          text("state"),
    country:        text("country"),
    zipCode:        text("zip_code"),
    website:        text("website"),
    
    // Soft delete
    deletedAt:      timestamp("deleted_at", { mode: "date" }),

    createdAt:      timestamp("created_at").defaultNow().notNull(),
    updatedAt:      timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("vendors_status_idx").on(t.status),
    index("vendors_email_idx").on(t.email),
    index("vendors_name_idx").on(t.name),
    index("vendors_code_idx").on(t.vendorCode),
  ]
);

export type Vendor    = InferSelectModel<typeof VendorsTable>;
export type NewVendor = InferInsertModel<typeof VendorsTable>;

// =============================================================================
// VENDOR AUTH TOKENS
// =============================================================================

export const VendorPasswordResetTokenTable = pgTable(
  "vendor_password_reset_tokens",
  {
    id:        uuid("id").defaultRandom().primaryKey().notNull(),
    vendorId:  uuid("vendor_id").notNull(),  // References VendorsTable.id
    token:     uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (t) => [
    uniqueIndex("vprt_vendor_token_key").on(t.vendorId, t.token),
    uniqueIndex("vprt_token_key").on(t.token),
  ]
);

export type VendorPasswordResetToken = InferSelectModel<typeof VendorPasswordResetTokenTable>;
export type NewVendorPasswordResetToken = InferInsertModel<typeof VendorPasswordResetTokenTable>;

// =============================================================================
// VENDOR SETTINGS (White-labeling & Configuration)
// =============================================================================

/**
 * Per-vendor operational and white-label settings.
 * One row per vendor, created automatically when vendor is created.
 */
export const VendorSettingsTable = pgTable(
  "vendor_settings",
  {
    id:       uuid("id").defaultRandom().primaryKey().notNull(),
    vendorId: uuid("vendor_id").notNull().unique(),

    // --- Deliverables ---
    deliverable: Deliverable("deliverable").default("REPORT").notNull(),

    // --- Raw data delivery ---
    s3BucketName:      text("s3_bucket_name"),
    rawDataEmail:      text("raw_data_email"),

    // --- Privacy settings ---
    hidePersonalInfo:  boolean("hide_personal_info").default(false).notNull(),
    passwordProtectedReport: boolean("password_protected_report").default(false).notNull(),
    passwordRule:      text("password_rule").default("NAME4_DOB").notNull(),

    // --- Logo & Images ---
    logoImg:           text("logo_img"),
    coverLogoImgName:  text("cover_logo_img_name"),

    // --- Cover & Page Settings ---
    coverPage:         boolean("cover_page").default(false).notNull(),
    skinCoverBackPage: boolean("skin_cover_back_page").default(false).notNull(),
    blankPage:         boolean("blank_page").default(false).notNull(),
    sectionImages:     boolean("section_images").default(false).notNull(),
    summaryPages:      boolean("summary_pages").default(false).notNull(),
    splitWellnessReport: boolean("split_wellness_report").default(false).notNull(),

    // --- Cover Images ---
    coverPageImgName:      text("cover_page_img_name"),
    backCoverPageImgName:  text("back_cover_page_img_name"),

    // --- Content ---
    welcomeMessage:    text("welcome_message"),
    about:             text("about"),
    aboutImgName:      text("about_img_name"),
    legalDisContent:   text("legal_dis_content"),

    // --- Signature Settings ---
    sigTitle:          text("sig_title"),
    sigName:           text("sig_name"),
    sigImgName:        text("sig_img_name"),

    // --- Theme Colors ---
    aboutThemeColor:   text("about_theme_color"),
    aboutTextColor:    text("about_text_color"),
    testThemeColor:    text("test_theme_color"),
    testTextColor:     text("test_text_color"),
    fitnessThemeColor: text("fitness_theme_color"),
    fitnessTextColor:  text("fitness_text_color"),
    weightThemeColor:  text("weight_theme_color"),
    weightTextColor:   text("weight_text_color"),
    detoxThemeColor:   text("detox_theme_color"),
    detoxTextColor:    text("detox_text_color"),
    cardiometThemeColor: text("cardiomet_theme_color"),
    cardiometTextColor:  text("cardiomet_text_color"),

    // --- Section Images ---
    dietPage1Img:      text("diet_page1_img"),
    dietPage2Img:      text("diet_page2_img"),
    fitnessPage1Img:   text("fitness_page1_img"),
    fitnessPage2Img:   text("fitness_page2_img"),
    weightPage1Img:    text("weight_page1_img"),
    weightPage2Img:    text("weight_page2_img"),
    detoxPage1Img:     text("detox_page1_img"),
    detoxPage2Img:     text("detox_page2_img"),
    imageOverview:     text("image_overview"),

    // --- Skin Report Settings ---
    skinCoverPageImg:      text("skin_cover_page_img"),
    skinBackCoverPageImg:  text("skin_back_cover_page_img"),

    // --- Cardiomet Report Settings ---
    cardiometPagesLogo:      boolean("cardiomet_pages_logo").default(false).notNull(),
    cardiometBackCoverPage:  text("cardiomet_back_cover_page"),
    cardiometCoverPageLogo:  boolean("cardiomet_cover_page_logo").default(false).notNull(),

    // --- Immunity Report Settings ---
    immunityCoverPage:        text("immunity_cover_page"),
    immunityBackCoverPage:    text("immunity_back_cover_page"),
    immunityBackCoverPageLogo: boolean("immunity_back_cover_page_logo").default(false).notNull(),
    immunityCoverPageLogo:    boolean("immunity_cover_page_logo").default(false).notNull(),

    // --- Autoimmune Report Settings ---
    autoimmuneCoverPage:        text("autoimmune_cover_page"),
    autoimmuneBackCoverPage:    text("autoimmune_back_cover_page"),
    autoimmuneBackCoverPageLogo: boolean("autoimmune_back_cover_page_logo").default(false).notNull(),
    autoimmuneCoverPageLogo:    boolean("autoimmune_cover_page_logo").default(false).notNull(),

    // --- Women's Health Report Settings ---
    womanCoverPage:        text("woman_cover_page"),
    womanBackCoverPage:    text("woman_back_cover_page"),
    womanBackCoverPageLogo: boolean("woman_back_cover_page_logo").default(false).notNull(),
    womanCoverPageLogo:    boolean("woman_cover_page_logo").default(false).notNull(),

    // --- Men's Health Report Settings ---
    menCoverPage:        text("men_cover_page"),
    menBackCoverPage:    text("men_back_cover_page"),
    menBackCoverPageLogo: boolean("men_back_cover_page_logo").default(false).notNull(),
    menCoverPageLogo:    boolean("men_cover_page_logo").default(false).notNull(),

    // --- Eye Health Report Settings ---
    eyeCoverPage:        text("eye_cover_page"),
    eyeBackCoverPage:    text("eye_back_cover_page"),
    eyeBackCoverPageLogo: boolean("eye_back_cover_page_logo").default(false).notNull(),
    eyeCoverPageLogo:    boolean("eye_cover_page_logo").default(false).notNull(),

    // --- Kidney Health Report Settings ---
    kidneyCoverPage:        text("kidney_cover_page"),
    kidneyBackCoverPage:    text("kidney_back_cover_page"),
    kidneyBackCoverPageLogo: boolean("kidney_back_cover_page_logo").default(false).notNull(),
    kidneyCoverPageLogo:    boolean("kidney_cover_page_logo").default(false).notNull(),

    // --- Sleep Health Report Settings ---
    sleepCoverPage:        text("sleep_cover_page"),
    sleepBackCoverPage:    text("sleep_back_cover_page"),
    sleepBackCoverPageLogo: boolean("sleep_back_cover_page_logo").default(false).notNull(),
    sleepCoverPageLogo:    boolean("sleep_cover_page_logo").default(false).notNull(),

    // --- Vendor Address for Reports ---
    vendorAddress:     text("vendor_address"),

    // --- Notification settings ---
    notifyTarget:      NotifyTarget("notify_target").default("BOTH").notNull(),
    notificationEvents: jsonb("notification_events"),

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
// VENDOR ETHNICITY MASTER
// =============================================================================

/**
 * Master table for ethnicities supported by each vendor.
 * Vendors can have multiple ethnicities they work with.
 */
export const VendorEthnicityMasterTable = pgTable(
  "vendor_ethnicity_master",
  {
    id:         uuid("id").defaultRandom().primaryKey().notNull(),
    ethnicity:  text("ethnicity").notNull(),
    vendorId:   uuid("vendor_id").notNull(),  // References VendorsTable.id
    
    createdAt:  timestamp("created_at").defaultNow().notNull(),
    updatedAt:  timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("vendor_ethnicity_unique").on(t.vendorId, t.ethnicity),
    index("vendor_ethnicity_vendor_idx").on(t.vendorId),
    index("vendor_ethnicity_name_idx").on(t.ethnicity),
  ]
);

export type VendorEthnicity    = InferSelectModel<typeof VendorEthnicityMasterTable>;
export type NewVendorEthnicity = InferInsertModel<typeof VendorEthnicityMasterTable>;

// =============================================================================
// VENDOR HOSPITAL MASTER
// =============================================================================

/**
 * Master table for hospitals/clinics associated with each vendor.
 * Vendors can have multiple hospital partners.
 */
export const VendorHospitalMasterTable = pgTable(
  "vendor_hospital_master",
  {
    id:         uuid("id").defaultRandom().primaryKey().notNull(),
    hospital:   text("hospital").notNull(),
    vendorId:   uuid("vendor_id").notNull(),  // References VendorsTable.id
    address:    text("address").notNull(),    // Encrypted
    contactNo:  text("contact_no").notNull(), // Encrypted
    
    isActive:   boolean("is_active").default(true).notNull(),
    createdAt:  timestamp("created_at").defaultNow().notNull(),
    updatedAt:  timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("vendor_hospital_unique").on(t.vendorId, t.hospital),
    index("vendor_hospital_vendor_idx").on(t.vendorId),
    index("vendor_hospital_name_idx").on(t.hospital),
  ]
);

export type VendorHospital    = InferSelectModel<typeof VendorHospitalMasterTable>;
export type NewVendorHospital = InferInsertModel<typeof VendorHospitalMasterTable>;

// =============================================================================
// TEST CATALOG
// =============================================================================

/**
 * Platform-level test catalog. Created and managed by ADMIN.
 *
 * Hierarchy via parentTestId:
 *   NULL parentTestId = root package (e.g. "Wellness All")
 *   parentTestId set  = sub-test within a package (e.g. "Diet", "Skin")
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
 */
export const PatientsTable = pgTable(
  "patients",
  {
    id:              uuid("id").defaultRandom().primaryKey().notNull(),

    /**
     * Human-readable patient ID. Auto-generated.
     * Format for BP patients:  "BP1PT000001"
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

    // --- Medical History (stored as JSONB) ---
    medicalHistory:  jsonb("medical_history"),

    isActive:        boolean("is_active").default(true).notNull(),
    createdAt:       timestamp("created_at").defaultNow().notNull(),
    updatedAt:       timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
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
 */
export const SamplesTable = pgTable(
  "samples",
  {
    id:              uuid("id").defaultRandom().primaryKey().notNull(),

    /**
     * Auto-generated public sample ID.
     * BP patient:   "BP1SL000001"
     * Printed on reports and kit labels.
     */
    sampleId:        text("sample_id").notNull(),

    /**
     * Internal NMC lab ID. Assigned when QC is passed.
     * Format: NMCGYY000001 (YY = 2-digit year, 6-digit sequence).
     */
    nmcgId:          text("nmcg_id"),

    /**
     * Optional additional ID supplied by the Business Partner.
     */
    partnerSampleId: text("partner_sample_id"),

    orderId:         uuid("order_id").notNull(),        // References OrdersTable.id
    vendorId:        uuid("vendor_id").notNull(),
    patientId:       uuid("patient_id").notNull(),      // References PatientsTable.id
    testCatalogId:   uuid("test_catalog_id").notNull(), // Which test this sample is for
    createdBy:       uuid("created_by").notNull(),

    // --- Physical sample details ---
    sampleType:      SampleType("sample_type").notNull(),
    kitBarcode:      text("kit_barcode"),               // GFX / Kit ID
    trfUrl:          text("trf_url"),                   // S3 URL of uploaded TRF/consent form
    dateSampleTaken: timestamp("date_sample_taken", { mode: "date" }),

    // --- Referring doctor / hospital ---
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
    validationSummary: jsonb("validation_summary"),

    // --- Cross-DB report pointers ---
    pdfPath:           text("pdf_path"),
    mongoReportId:     text("mongo_report_id"),
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
 */
export const ShipmentSamplesTable = pgTable(
  "shipment_samples",
  {
    id:           uuid("id").defaultRandom().primaryKey().notNull(),
    shipmentId:   uuid("shipment_id").notNull(),   // References ShipmentsTable.id
    sampleId:     uuid("sample_id").notNull(),     // References SamplesTable.id

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
 */
export const InvoicesTable = pgTable(
  "invoices",
  {
    id:          uuid("id").defaultRandom().primaryKey().notNull(),
    invoiceNo:   text("invoice_no").notNull(),
    vendorId:    uuid("vendor_id").notNull(),
    orderId:     uuid("order_id"),

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
 */
export const HelpdeskTable = pgTable(
  "helpdesk",
  {
    id:         uuid("id").defaultRandom().primaryKey().notNull(),
    vendorId:   uuid("vendor_id"),                  // NULL if raised by NMC staff internally
    raisedBy:   uuid("raised_by").notNull(),        // References UsersTable.id

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
 */
export const AuditLogTable = pgTable(
  "audit_log",
  {
    id:        uuid("id").defaultRandom().primaryKey().notNull(),
    actorId:   uuid("actor_id").notNull(),   // User who performed the action
    vendorId:  uuid("vendor_id"),            // Vendor context if applicable

    action:    text("action").notNull(),
    entity:    text("entity").notNull(),     // Table name
    entityId:  text("entity_id"),            // Row affected

    before:    jsonb("before"),              // Previous state snapshot
    after:     jsonb("after"),               // New state snapshot

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    note:      text("note"),

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

export const usersRelations = relations(UsersTable, ({ many }) => ({
  patients:       many(PatientsTable),
  orders:         many(OrdersTable),
  samples:        many(SamplesTable),
  tickets:        many(HelpdeskTable),
  ticketReplies:  many(TicketRepliesTable),
  createdVendors: many(VendorsTable),
}));

export const vendorsRelations = relations(VendorsTable, ({ one, many }) => ({
  settings:       one(VendorSettingsTable, { fields: [VendorsTable.id], references: [VendorSettingsTable.vendorId] }),
  ethnicities:    many(VendorEthnicityMasterTable),
  hospitals:      many(VendorHospitalMasterTable),
  patients:       many(PatientsTable),
  orders:         many(OrdersTable),
  samples:        many(SamplesTable),
  shipments:      many(ShipmentsTable),
  invoices:       many(InvoicesTable),
  pricelist:      many(PricelistTable),
  tickets:        many(HelpdeskTable),
  addedByUser:    one(UsersTable, { fields: [VendorsTable.addedBy], references: [UsersTable.id] }),
  passwordResetTokens: many(VendorPasswordResetTokenTable),
}));

export const vendorSettingsRelations = relations(VendorSettingsTable, ({ one }) => ({
  vendor: one(VendorsTable, { fields: [VendorSettingsTable.vendorId], references: [VendorsTable.id] }),
}));

export const vendorEthnicityRelations = relations(VendorEthnicityMasterTable, ({ one }) => ({
  vendor: one(VendorsTable, { fields: [VendorEthnicityMasterTable.vendorId], references: [VendorsTable.id] }),
}));

export const vendorHospitalRelations = relations(VendorHospitalMasterTable, ({ one }) => ({
  vendor: one(VendorsTable, { fields: [VendorHospitalMasterTable.vendorId], references: [VendorsTable.id] }),
}));

export const vendorPasswordResetTokenRelations = relations(VendorPasswordResetTokenTable, ({ one }) => ({
  vendor: one(VendorsTable, { fields: [VendorPasswordResetTokenTable.vendorId], references: [VendorsTable.id] }),
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