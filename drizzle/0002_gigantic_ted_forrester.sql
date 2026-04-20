ALTER TABLE "vendors" ADD COLUMN "login_slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_login_slug_unique" UNIQUE("login_slug");