-- Update job_positions: change id from serial to varchar(13) and update schema
ALTER TABLE "candidate_applications" DROP CONSTRAINT "candidate_applications_position_id_job_positions_id_fk";--> statement-breakpoint
ALTER TABLE "interview_links" DROP CONSTRAINT "interview_links_position_id_job_positions_id_fk";--> statement-breakpoint
ALTER TABLE "interviews" DROP CONSTRAINT "interviews_position_id_job_positions_id_fk";--> statement-breakpoint

-- Drop old job_positions table and recreate with new schema
DROP TABLE "job_positions" CASCADE;--> statement-breakpoint

CREATE TABLE "job_positions" (
	"id" varchar(13) PRIMARY KEY NOT NULL,
	"recruiter_id" varchar(256),
	"user_id" varchar(256),
	"title" varchar(256) NOT NULL,
	"department" varchar(256),
	"description" text NOT NULL,
	"evaluation_description" text,
	"location" varchar(256),
	"employment_type" varchar(50),
	"language" varchar(50) DEFAULT 'English',
	"start_date" timestamp,
	"end_date" timestamp,
	"registration_start_date" timestamp,
	"registration_end_date" timestamp,
	"job_position" varchar(256),
	"required_experience" varchar(50),
	"question_count" integer DEFAULT 8,
	"duration" integer DEFAULT 30,
	"anti_cheat_enabled" boolean DEFAULT true,
	"ai_questions" jsonb DEFAULT '[]'::jsonb,
	"interviewer" varchar(20) DEFAULT 'gemini',
	"voice_provider" varchar(50) DEFAULT 'vapi',
	"voice_id" varchar(256) DEFAULT 'monitor',
	"system_prompt" text,
	"agent_name" varchar(256) DEFAULT 'Viktor',
	"tone" varchar(50) DEFAULT 'Friendly',
	"evaluation_criteria" jsonb DEFAULT '[]'::jsonb,
	"candidate_evaluation" text,
	"price" integer DEFAULT 50,
	"access_type" varchar(50) DEFAULT 'Public (Anyone)',
	"status" varchar(50) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);--> statement-breakpoint

-- Update interview_links to use varchar for position_id
ALTER TABLE "interview_links" ALTER COLUMN "position_id" TYPE varchar(13);--> statement-breakpoint

-- Update candidate_applications: change position_id type and add new columns
ALTER TABLE "candidate_applications" ALTER COLUMN "position_id" TYPE varchar(13);--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "public_id" varchar(256);--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "cv" text;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "candidate_interview" text;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "interview_taken" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "is_rejected" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "reject_reason" text;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "result" jsonb;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "reason_result" text;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD COLUMN "snapshot_urls" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "candidate_applications" DROP COLUMN "resume_url";--> statement-breakpoint

-- Update interviews.position_id to varchar
ALTER TABLE "interviews" ALTER COLUMN "position_id" TYPE varchar(13);--> statement-breakpoint

-- Create trainee_interviews table
CREATE TABLE "trainee_interviews" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"title" varchar(256) NOT NULL,
	"duration" integer DEFAULT 30,
	"question_count" integer DEFAULT 8,
	"department" varchar(256),
	"language" varchar(50) DEFAULT 'English',
	"experience_level" varchar(50),
	"description" text,
	"system_prompt" text,
	"ai_questions" jsonb DEFAULT '[]'::jsonb,
	"recommendation" text,
	"evaluation_criteria" jsonb DEFAULT '[]'::jsonb,
	"voice_provider" varchar(50) DEFAULT 'vapi',
	"voice_id" varchar(256) DEFAULT 'monitor',
	"agent_name" varchar(256) DEFAULT 'Viktor',
	"tone" varchar(50) DEFAULT 'Friendly',
	"interviewer" varchar(20) DEFAULT 'vapi',
	"transcripts" jsonb DEFAULT '{}'::jsonb,
	"results" jsonb DEFAULT '{}'::jsonb,
	"result_reasons" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(50) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);--> statement-breakpoint

-- Create trainee_quiz_attempts table
CREATE TABLE "trainee_quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"interview_id" varchar(12),
	"agent_id" integer,
	"title" varchar(256),
	"score" integer DEFAULT 0,
	"total" integer DEFAULT 0,
	"questions" jsonb DEFAULT '[]'::jsonb,
	"answers" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Re-add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "interview_links" ADD CONSTRAINT "interview_links_position_id_job_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."job_positions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "candidate_applications" ADD CONSTRAINT "candidate_applications_position_id_job_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."job_positions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "interviews" ADD CONSTRAINT "interviews_position_id_job_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."job_positions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "trainee_interviews" ADD CONSTRAINT "trainee_interviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "trainee_quiz_attempts" ADD CONSTRAINT "trainee_quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
