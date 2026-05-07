CREATE TABLE IF NOT EXISTS "interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"candidate_id" varchar(256),
	"candidate_email" varchar(256),
	"candidate_name" varchar(256),
	"type" varchar(50) NOT NULL,
	"fit_score" integer,
	"analysis_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"screenshots" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"transcript" jsonb,
	"audio_url" varchar(256),
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sdk_apps" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"agent_id" integer,
	"name" text NOT NULL,
	"public_key" text NOT NULL,
	"domain_whitelist" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sdk_apps_public_key_unique" UNIQUE("public_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sdk_manifests" (
	"id" serial PRIMARY KEY NOT NULL,
	"app_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"environment" text DEFAULT 'development',
	"actions" jsonb DEFAULT '[]'::jsonb,
	"state_schema" jsonb DEFAULT '{}'::jsonb,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trainee_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"agent_id" integer NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"quiz_scores" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_trained_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "call_agents" ADD COLUMN "recruitment_config" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "call_agents" ADD COLUMN "marketplace_config" jsonb DEFAULT '{"isForSale":false,"usageCount":0}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "calls" ADD COLUMN "is_exported" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "credits" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviews" ADD CONSTRAINT "interviews_agent_id_call_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."call_agents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sdk_apps" ADD CONSTRAINT "sdk_apps_agent_id_call_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."call_agents"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sdk_manifests" ADD CONSTRAINT "sdk_manifests_app_id_sdk_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."sdk_apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trainee_progress" ADD CONSTRAINT "trainee_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trainee_progress" ADD CONSTRAINT "trainee_progress_agent_id_call_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."call_agents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
