CREATE TABLE "portal"."key_meta" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"label" text,
	"created_via" text DEFAULT 'portal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoke_reason" text
);
--> statement-breakpoint
ALTER TABLE "portal"."key_meta" ADD CONSTRAINT "key_meta_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "portal"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "key_meta_user_id_idx" ON "portal"."key_meta" USING btree ("user_id");