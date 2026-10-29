CREATE SCHEMA IF NOT EXISTS "portal";
--> statement-breakpoint
CREATE TABLE "portal"."audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event" text NOT NULL,
	"sam" text,
	"user_id" uuid,
	"ip" "inet",
	"detail" text
);
--> statement-breakpoint
CREATE TABLE "portal"."login_attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" "inet" NOT NULL,
	"sam" text NOT NULL,
	"success" boolean NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "portal"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip" "inet",
	"user_agent" text,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "portal"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sam" text NOT NULL,
	"display_name" text NOT NULL,
	"mail" text,
	"ldap_dn" text NOT NULL,
	"role" text NOT NULL,
	"litellm_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_role_check" CHECK ("portal"."users"."role" in ('student', 'teacher', 'staff', 'admin'))
);
--> statement-breakpoint
ALTER TABLE "portal"."audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "portal"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "portal"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "portal"."audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_log_sam_idx" ON "portal"."audit_log" USING btree ("sam");--> statement-breakpoint
CREATE INDEX "login_attempts_created_at_idx" ON "portal"."login_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "login_attempts_sam_idx" ON "portal"."login_attempts" USING btree ("sam");--> statement-breakpoint
CREATE INDEX "login_attempts_ip_idx" ON "portal"."login_attempts" USING btree ("ip");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "portal"."sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "portal"."sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "portal"."sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_sam_key" ON "portal"."users" USING btree ("sam");