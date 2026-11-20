CREATE TABLE "portal"."credit_grant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_usd" numeric(10, 2) NOT NULL,
	"max_budget_after_usd" numeric(10, 2) NOT NULL,
	"note" text,
	"granted_by" uuid,
	"resets_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_grant_amount_check" CHECK ("portal"."credit_grant"."amount_usd" > 0)
);
--> statement-breakpoint
ALTER TABLE "portal"."credit_grant" ADD CONSTRAINT "credit_grant_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "portal"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal"."credit_grant" ADD CONSTRAINT "credit_grant_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "portal"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_grant_user_id_idx" ON "portal"."credit_grant" USING btree ("user_id");