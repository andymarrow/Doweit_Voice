CREATE TABLE IF NOT EXISTS "actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" varchar(256),
	"name" varchar(256) NOT NULL,
	"display_name" varchar(256),
	"description" text,
	"type" varchar(50) NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"source" varchar(50) DEFAULT 'custom' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"action_id" integer NOT NULL,
	"timing" varchar(20) NOT NULL,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"hashed_key" varchar(256) NOT NULL,
	"key_preview" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "api_keys_hashed_key_unique" UNIQUE("hashed_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "call_action_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_id" integer NOT NULL,
	"agent_action_id" integer NOT NULL,
	"value" jsonb,
	"raw_value" text,
	"extracted_at" timestamp DEFAULT now() NOT NULL,
	"confidence" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "call_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"type" varchar(50) NOT NULL,
	"avatar_url" varchar(256),
	"voice_engine" varchar(50),
	"ai_model" varchar(50),
	"timezone" varchar(100),
	"custom_vocabulary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"use_filler_words" boolean DEFAULT true NOT NULL,
	"prompt" text,
	"greeting_message" text,
	"voice_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"call_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"knowledge_base_id" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"contact_id" integer,
	"phone_number" varchar(256) NOT NULL,
	"direction" varchar(20) NOT NULL,
	"status" varchar(50) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer,
	"transcript" jsonb,
	"summary" text,
	"audio_url" varchar(256),
	"raw_call_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "character_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"character_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"tagline" varchar(256),
	"description" text NOT NULL,
	"greeting" text NOT NULL,
	"avatar_url" varchar(256),
	"voice_id" varchar(256),
	"voice_name" varchar(256),
	"voice_provider" varchar(50) NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"behavior" json,
	"is_public" boolean DEFAULT true NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"chats" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_session_id" varchar(256) NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"character_id" integer NOT NULL,
	"sender" varchar(10) NOT NULL,
	"text" text NOT NULL,
	"audio_url" varchar(256),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" varchar(256) NOT NULL,
	"first_name" varchar(256),
	"last_name" varchar(256),
	"phone_number" varchar(256) NOT NULL,
	"email" varchar(256),
	"other_details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_bases" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"content" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'processing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"encrypted_access_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"username" varchar(256),
	"email" varchar(256),
	"profile_image_url" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voices" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" varchar(256),
	"provider_voice_id" varchar(256) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"avatar_url" varchar(256),
	"sample_audio_url" varchar(256),
	"category" varchar(50),
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actions" ADD CONSTRAINT "actions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_actions" ADD CONSTRAINT "agent_actions_agent_id_call_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."call_agents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_actions" ADD CONSTRAINT "agent_actions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_action_values" ADD CONSTRAINT "call_action_values_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_action_values" ADD CONSTRAINT "call_action_values_agent_action_id_agent_actions_id_fk" FOREIGN KEY ("agent_action_id") REFERENCES "public"."agent_actions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_agents" ADD CONSTRAINT "call_agents_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_agents" ADD CONSTRAINT "call_agents_knowledge_base_id_knowledge_bases_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_bases"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calls" ADD CONSTRAINT "calls_agent_id_call_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."call_agents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calls" ADD CONSTRAINT "calls_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "character_likes" ADD CONSTRAINT "character_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "character_likes" ADD CONSTRAINT "character_likes_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "characters" ADD CONSTRAINT "characters_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voices" ADD CONSTRAINT "voices_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "action_creator_name_unq" ON "actions" USING btree ("creator_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "agent_action_timing_unq" ON "agent_actions" USING btree ("agent_id","action_id","timing");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "call_agent_action_value_unq" ON "call_action_values" USING btree ("call_id","agent_action_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_character_unq" ON "character_likes" USING btree ("user_id","character_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "contact_creator_phone_unq" ON "contacts" USING btree ("creator_id","phone_number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_provider_unq" ON "user_connections" USING btree ("user_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_provider_voice_unq" ON "voices" USING btree ("creator_id","provider","provider_voice_id");