ALTER TABLE "orders" ALTER COLUMN "remark" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_date" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "samples" ALTER COLUMN "kit_barcode" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "samples" ALTER COLUMN "date_sample_taken" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "samples" ALTER COLUMN "tat_due_at" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "sample_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "added_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipment_status" text DEFAULT 'Pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "status_code" text DEFAULT 'O001' NOT NULL;--> statement-breakpoint
ALTER TABLE "samples" ADD COLUMN "sample_time" text DEFAULT '12:00:00';--> statement-breakpoint
ALTER TABLE "samples" ADD COLUMN "subtests" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "samples" ADD COLUMN "added_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "samples" ADD COLUMN "vendor_sample_id" text DEFAULT '';--> statement-breakpoint
CREATE INDEX "orders_sample_idx" ON "orders" USING btree ("sample_id");--> statement-breakpoint
CREATE INDEX "orders_status_code_idx" ON "orders" USING btree ("status_code");--> statement-breakpoint
CREATE INDEX "orders_shipment_status_idx" ON "orders" USING btree ("shipment_status");--> statement-breakpoint
CREATE INDEX "samples_added_by_idx" ON "samples" USING btree ("added_by");--> statement-breakpoint
CREATE INDEX "samples_date_taken_idx" ON "samples" USING btree ("date_sample_taken");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_no_unique" UNIQUE("order_no");--> statement-breakpoint
ALTER TABLE "samples" ADD CONSTRAINT "samples_sample_id_unique" UNIQUE("sample_id");