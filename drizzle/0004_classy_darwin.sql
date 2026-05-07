CREATE TABLE IF NOT EXISTS "candidate_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" integer NOT NULL,
	"candidate_id" varchar(256),
	"candidate_name" varchar(256) NOT NULL,
	"candidate_email" varchar(256) NOT NULL,
	"candidate_phone" varchar(256),
	"resume_url" varchar(256),
	"portfolio_url" varchar(256),
	"linkedin_url" varchar(256),
	"experience" varchar(50),
	"country" varchar(256),
	"status" varchar(50) DEFAULT 'applied',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" integer NOT NULL,
	"link_id" varchar(256) NOT NULL,
	"custom_url" varchar(256),
	"max_uses" integer DEFAULT 1,
	"current_uses" integer DEFAULT 0,
	"expires_at" timestamp,
	"require_password" boolean DEFAULT false,
	"password" varchar(256),
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interview_links_link_id_unique" UNIQUE("link_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"recruiter_id" varchar(256) NOT NULL,
	"title" varchar(256) NOT NULL,
	"department" varchar(256),
	"description" text NOT NULL,
	"requirements" text,
	"experience_level" varchar(50),
	"location" varchar(256),
	"salary" varchar(256),
	"employment_type" varchar(50),
	"question_count" integer DEFAULT 8,
	"duration" integer DEFAULT 30,
	"anti_cheat_enabled" boolean DEFAULT true,
	"ai_questions" jsonb DEFAULT '[]'::jsonb,
	"voice_provider" varchar(50) DEFAULT 'vapi',
	"voice_id" varchar(256) DEFAULT 'monitor',
	"system_prompt" text,
	"agent_name" varchar(256) DEFAULT 'Viktor',
	"tone" varchar(50) DEFAULT 'Friendly',
	"evaluation_criteria" jsonb DEFAULT '[]'::jsonb,
	"price" integer DEFAULT 50,
	"access_type" varchar(50) DEFAULT 'Public (Anyone)',
	"status" varchar(50) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "agent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "type" SET DEFAULT 'real_application';--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "link_id" varchar(256);--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "position_id" integer;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "candidate_phone" varchar(256);--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "portfolio_url" varchar(256);--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "linkedin_url" varchar(256);--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "experience" varchar(50);--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "country" varchar(256);--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidate_applications" ADD CONSTRAINT "candidate_applications_position_id_job_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."job_positions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidate_applications" ADD CONSTRAINT "candidate_applications_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_links" ADD CONSTRAINT "interview_links_position_id_job_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."job_positions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_positions" ADD CONSTRAINT "job_positions_recruiter_id_users_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviews" ADD CONSTRAINT "interviews_position_id_job_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."job_positions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
