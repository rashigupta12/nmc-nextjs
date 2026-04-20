CREATE TYPE "public"."deliverable" AS ENUM('REPORT', 'RAW_DATA', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."notify_target" AS ENUM('SUBJECT', 'BUSINESS_PARTNER', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."sample_status" AS ENUM('CREATED', 'SHIPPED', 'RECEIVED', 'QC_PASSED', 'QC_FAILED', 'PROCESSING', 'READY', 'REPORT_GENERATED', 'RELEASED', 'RESAMPLING');--> statement-breakpoint
CREATE TYPE "public"."sample_type" AS ENUM('SALIVA', 'BLOOD', 'TISSUE');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('CREATED', 'COURIERED', 'IN_TRANSIT', 'RECEIVED', 'PARTIALLY_RECEIVED');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SUPER_ADMIN', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."vendor_status" AS ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"vendor_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"before" jsonb,
	"after" jsonb,
	"ip_address" text,
	"user_agent" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helpdesk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid,
	"raised_by" uuid NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" "ticket_status" DEFAULT 'OPEN' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'MEDIUM' NOT NULL,
	"assigned_to" uuid,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_no" text NOT NULL,
	"vendor_id" uuid NOT NULL,
	"order_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"due_at" timestamp,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_no" text NOT NULL,
	"vendor_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"total_amount" numeric(10, 2),
	"currency" text DEFAULT 'INR' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"remark" text,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" text NOT NULL,
	"vendor_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"gender" text NOT NULL,
	"dob" text,
	"age" integer,
	"height" numeric(5, 2),
	"weight" numeric(5, 2),
	"nationality" text,
	"ethnicity" text,
	"phone" text,
	"email" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"zip_code" text,
	"medical_history" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricelist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_catalog_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sample_id" text NOT NULL,
	"nmcg_id" text,
	"partner_sample_id" text,
	"order_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"test_catalog_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"sample_type" "sample_type" NOT NULL,
	"kit_barcode" text,
	"trf_url" text,
	"date_sample_taken" timestamp,
	"referring_doctor" jsonb,
	"status" "sample_status" DEFAULT 'CREATED' NOT NULL,
	"qc_rejection_reason" text,
	"shipped_at" timestamp,
	"received_at" timestamp,
	"qc_passed_at" timestamp,
	"processed_at" timestamp,
	"report_generated_at" timestamp,
	"released_at" timestamp,
	"tat_due_at" timestamp,
	"csv_uploaded" boolean DEFAULT false NOT NULL,
	"csv_validated" boolean DEFAULT false NOT NULL,
	"validation_summary" jsonb,
	"pdf_path" text,
	"mongo_report_id" text,
	"report_generated" boolean DEFAULT false NOT NULL,
	"report_released" boolean DEFAULT false NOT NULL,
	"report_password_protected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"sample_id" uuid NOT NULL,
	"accepted" boolean,
	"rejection_reason" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_no" text NOT NULL,
	"vendor_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"status" "shipment_status" DEFAULT 'CREATED' NOT NULL,
	"courier_service" text,
	"courier_number" text,
	"courier_date" timestamp,
	"received_by" uuid,
	"received_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_code" text NOT NULL,
	"test_name" text NOT NULL,
	"alias" text,
	"description" text,
	"parent_test_id" uuid,
	"sub_parent_of" uuid,
	"tat_days" integer NOT NULL,
	"price" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"phone" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_password_reset" boolean DEFAULT false NOT NULL,
	"email_verified" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_ethnicity_master" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ethnicity" text NOT NULL,
	"vendor_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_hospital_master" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospital" text NOT NULL,
	"vendor_id" uuid NOT NULL,
	"address" text NOT NULL,
	"contact_no" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"token" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"deliverable" "deliverable" DEFAULT 'REPORT' NOT NULL,
	"s3_bucket_name" text,
	"raw_data_email" text,
	"hide_personal_info" boolean DEFAULT false NOT NULL,
	"password_protected_report" boolean DEFAULT false NOT NULL,
	"password_rule" text DEFAULT 'NAME4_DOB' NOT NULL,
	"logo_img" text,
	"cover_logo_img_name" text,
	"cover_page" boolean DEFAULT false NOT NULL,
	"skin_cover_back_page" boolean DEFAULT false NOT NULL,
	"blank_page" boolean DEFAULT false NOT NULL,
	"section_images" boolean DEFAULT false NOT NULL,
	"summary_pages" boolean DEFAULT false NOT NULL,
	"split_wellness_report" boolean DEFAULT false NOT NULL,
	"cover_page_img_name" text,
	"back_cover_page_img_name" text,
	"welcome_message" text,
	"about" text,
	"about_img_name" text,
	"legal_dis_content" text,
	"sig_title" text,
	"sig_name" text,
	"sig_img_name" text,
	"about_theme_color" text,
	"about_text_color" text,
	"test_theme_color" text,
	"test_text_color" text,
	"fitness_theme_color" text,
	"fitness_text_color" text,
	"weight_theme_color" text,
	"weight_text_color" text,
	"detox_theme_color" text,
	"detox_text_color" text,
	"cardiomet_theme_color" text,
	"cardiomet_text_color" text,
	"diet_page1_img" text,
	"diet_page2_img" text,
	"fitness_page1_img" text,
	"fitness_page2_img" text,
	"weight_page1_img" text,
	"weight_page2_img" text,
	"detox_page1_img" text,
	"detox_page2_img" text,
	"image_overview" text,
	"skin_cover_page_img" text,
	"skin_back_cover_page_img" text,
	"cardiomet_pages_logo" boolean DEFAULT false NOT NULL,
	"cardiomet_back_cover_page" text,
	"cardiomet_cover_page_logo" boolean DEFAULT false NOT NULL,
	"immunity_cover_page" text,
	"immunity_back_cover_page" text,
	"immunity_back_cover_page_logo" boolean DEFAULT false NOT NULL,
	"immunity_cover_page_logo" boolean DEFAULT false NOT NULL,
	"autoimmune_cover_page" text,
	"autoimmune_back_cover_page" text,
	"autoimmune_back_cover_page_logo" boolean DEFAULT false NOT NULL,
	"autoimmune_cover_page_logo" boolean DEFAULT false NOT NULL,
	"woman_cover_page" text,
	"woman_back_cover_page" text,
	"woman_back_cover_page_logo" boolean DEFAULT false NOT NULL,
	"woman_cover_page_logo" boolean DEFAULT false NOT NULL,
	"men_cover_page" text,
	"men_back_cover_page" text,
	"men_back_cover_page_logo" boolean DEFAULT false NOT NULL,
	"men_cover_page_logo" boolean DEFAULT false NOT NULL,
	"eye_cover_page" text,
	"eye_back_cover_page" text,
	"eye_back_cover_page_logo" boolean DEFAULT false NOT NULL,
	"eye_cover_page_logo" boolean DEFAULT false NOT NULL,
	"kidney_cover_page" text,
	"kidney_back_cover_page" text,
	"kidney_back_cover_page_logo" boolean DEFAULT false NOT NULL,
	"kidney_cover_page_logo" boolean DEFAULT false NOT NULL,
	"sleep_cover_page" text,
	"sleep_back_cover_page" text,
	"sleep_back_cover_page_logo" boolean DEFAULT false NOT NULL,
	"sleep_cover_page_logo" boolean DEFAULT false NOT NULL,
	"vendor_address" text,
	"notify_target" "notify_target" DEFAULT 'BOTH' NOT NULL,
	"notification_events" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_settings_vendor_id_unique" UNIQUE("vendor_id")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_code" text NOT NULL,
	"status" "vendor_status" DEFAULT 'ACTIVE' NOT NULL,
	"name" text NOT NULL,
	"contact_no" text NOT NULL,
	"gender" text NOT NULL,
	"cost_centre_no" text,
	"mr_no" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"logo" text,
	"remark" text,
	"loginurl" text NOT NULL,
	"added_by" uuid NOT NULL,
	"is_password_reset" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp,
	"address" text NOT NULL,
	"cin_number" text,
	"vat_number" text,
	"gst_number" text,
	"city" text,
	"state" text,
	"country" text,
	"zip_code" text,
	"website" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_vendor_code_unique" UNIQUE("vendor_code")
);
--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_log_vendor_idx" ON "audit_log" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "evt_email_token_key" ON "email_verification_tokens" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX "evt_token_key" ON "email_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "helpdesk_vendor_idx" ON "helpdesk" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "helpdesk_status_idx" ON "helpdesk" USING btree ("status");--> statement-breakpoint
CREATE INDEX "helpdesk_assigned_idx" ON "helpdesk" USING btree ("assigned_to");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_invoice_no_key" ON "invoices" USING btree ("invoice_no");--> statement-breakpoint
CREATE INDEX "invoices_vendor_idx" ON "invoices" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_no_key" ON "orders" USING btree ("order_no");--> statement-breakpoint
CREATE INDEX "orders_vendor_idx" ON "orders" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "orders_patient_idx" ON "orders" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "orders_date_idx" ON "orders" USING btree ("order_date");--> statement-breakpoint
CREATE UNIQUE INDEX "prt_email_token_key" ON "password_reset_tokens" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX "prt_token_key" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "patients_vendor_patient_key" ON "patients" USING btree ("vendor_id","patient_id");--> statement-breakpoint
CREATE INDEX "patients_vendor_idx" ON "patients" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "patients" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE UNIQUE INDEX "pricelist_test_vendor_key" ON "pricelist" USING btree ("test_catalog_id","vendor_id");--> statement-breakpoint
CREATE INDEX "pricelist_vendor_idx" ON "pricelist" USING btree ("vendor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "samples_sample_id_key" ON "samples" USING btree ("sample_id");--> statement-breakpoint
CREATE UNIQUE INDEX "samples_nmcg_id_key" ON "samples" USING btree ("nmcg_id");--> statement-breakpoint
CREATE INDEX "samples_order_idx" ON "samples" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "samples_vendor_idx" ON "samples" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "samples_patient_idx" ON "samples" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "samples_status_idx" ON "samples" USING btree ("status");--> statement-breakpoint
CREATE INDEX "samples_tat_idx" ON "samples" USING btree ("tat_due_at");--> statement-breakpoint
CREATE INDEX "samples_partner_sample_idx" ON "samples" USING btree ("partner_sample_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shipment_samples_key" ON "shipment_samples" USING btree ("shipment_id","sample_id");--> statement-breakpoint
CREATE INDEX "shipment_samples_shipment_idx" ON "shipment_samples" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "shipment_samples_sample_idx" ON "shipment_samples" USING btree ("sample_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shipments_shipment_no_key" ON "shipments" USING btree ("shipment_no");--> statement-breakpoint
CREATE INDEX "shipments_vendor_idx" ON "shipments" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "shipments_status_idx" ON "shipments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shipments_courier_idx" ON "shipments" USING btree ("courier_number");--> statement-breakpoint
CREATE UNIQUE INDEX "test_catalog_code_key" ON "test_catalog" USING btree ("test_code");--> statement-breakpoint
CREATE INDEX "test_catalog_parent_idx" ON "test_catalog" USING btree ("parent_test_id");--> statement-breakpoint
CREATE INDEX "test_catalog_active_idx" ON "test_catalog" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "ticket_replies_ticket_idx" ON "ticket_replies" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_replies_author_idx" ON "ticket_replies" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_ethnicity_unique" ON "vendor_ethnicity_master" USING btree ("vendor_id","ethnicity");--> statement-breakpoint
CREATE INDEX "vendor_ethnicity_vendor_idx" ON "vendor_ethnicity_master" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "vendor_ethnicity_name_idx" ON "vendor_ethnicity_master" USING btree ("ethnicity");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_hospital_unique" ON "vendor_hospital_master" USING btree ("vendor_id","hospital");--> statement-breakpoint
CREATE INDEX "vendor_hospital_vendor_idx" ON "vendor_hospital_master" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "vendor_hospital_name_idx" ON "vendor_hospital_master" USING btree ("hospital");--> statement-breakpoint
CREATE UNIQUE INDEX "vprt_vendor_token_key" ON "vendor_password_reset_tokens" USING btree ("vendor_id","token");--> statement-breakpoint
CREATE UNIQUE INDEX "vprt_token_key" ON "vendor_password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "vendor_settings_vendor_idx" ON "vendor_settings" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "vendors_status_idx" ON "vendors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vendors_email_idx" ON "vendors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "vendors_name_idx" ON "vendors" USING btree ("name");--> statement-breakpoint
CREATE INDEX "vendors_code_idx" ON "vendors" USING btree ("vendor_code");