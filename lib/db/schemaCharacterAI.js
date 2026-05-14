// lib/db/schemaCharacterAI.js
import {
	boolean,
	integer,
	json,
	pgTable,
	serial,
	varchar,
	timestamp,
	text, // Use text for potentially long descriptions/greetings/messages
	uniqueIndex, // Import uniqueIndex for constraints
	jsonb,
	uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"; // Import relations for defining relationships

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verifications = pgTable("verifications", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
// Users table (linked to Clerk user ID)
export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	credits: integer("credits").default(100).notNull(), // Added credits/tokens for marketplace
	tokenBalance: integer("token_balance").default(1000).notNull(), // Interview token balance (1 min = 10 tokens)
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});


// Characters table
export const characters = pgTable("characters", {
	id: serial("id").primaryKey(),
	// Non-sequential public identifier used in URLs. Sequential `id` is kept
	// as the primary key for FK targets, but URLs/links use `publicId` so
	// agents/characters can't be enumerated by guessing /1, /2, /3.
	publicId: uuid("public_id").defaultRandom().notNull().unique(),
	// Link to the user who created the character
	creatorId: varchar("creator_id", { length: 256 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }), // Cascade delete characters if user is deleted
	name: varchar("name", { length: 256 }).notNull(),
	tagline: varchar("tagline", { length: 256 }),
	description: text("description").notNull(), // Use text for longer content
	greeting: text("greeting").notNull(), // Use text for longer content
	avatarUrl: varchar("avatar_url", { length: 256 }), // Firebase Storage URL
	// AI Voice details
	voiceId: varchar("voice_id", { length: 256 }), // AI Studio platform voice ID (e.g., 'Zephyr')
	voiceName: varchar("voice_name", { length: 256 }), // Friendly name
	voiceProvider: varchar("voice_provider", { length: 50 }).notNull(),
	// Language constraint
	language: varchar("language", { length: 10 }).notNull().default("en"), // e.g., 'en', 'am'
	// Behavior tags
	behavior: json("behavior"), // Store as JSON array of strings
	// Visibility
	isPublic: boolean("is_public").notNull().default(true),
	// Engagement metrics
	likes: integer("likes").notNull().default(0),
	chats: integer("chats").notNull().default(0),
	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations for characters (e.g., character belongs to a creator, has many messages)
export const charactersRelations = relations(characters, ({ one, many }) => ({
	creator: one(users, {
		fields: [characters.creatorId],
		references: [users.id],
	}),
	chatMessages: many(chatMessages), // A character receives/sends many messages
	characterLikes: many(characterLikes), // A character can be liked by many users
}));

// Chat Messages table
export const chatMessages = pgTable("chat_messages", {
	id: serial("id").primaryKey(),
	// Unique identifier for a specific chat session (user + character combination)
	// This allows grouping messages for context
	chatSessionId: varchar("chat_session_id", { length: 256 }).notNull(), // e.g., "clerkUserId_characterId"
	userId: varchar("user_id", { length: 256 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }), // Link to the user who sent/received
	characterId: integer("character_id")
		.notNull()
		.references(() => characters.id, { onDelete: "cascade" }), // Link to the character
	sender: varchar("sender", { length: 10 }).notNull(), // 'user' or 'character'
	text: text("text").notNull(), // Message text
	audioUrl: varchar("audio_url", { length: 256 }), // URL to AI character's audio response (if generated/stored)
	timestamp: timestamp("timestamp").defaultNow().notNull(), // When the message was sent/received
});

// Define relations for chat messages
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
	user: one(users, {
		fields: [chatMessages.userId],
		references: [users.id],
	}),
	character: one(characters, {
		fields: [chatMessages.characterId],
		references: [characters.id],
	}),
}));

// Character Likes table
export const characterLikes = pgTable(
	"character_likes",
	{
		id: serial("id").primaryKey(),
		userId: varchar("user_id", { length: 256 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		characterId: integer("character_id")
			.notNull()
			.references(() => characters.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(t) => ({
		// Ensure a user can only like a character once
		unqUserCharacter: uniqueIndex("user_character_unq").on(
			t.userId,
			t.characterId,
		),
	}),
);

// Define relations for character likes
export const characterLikesRelations = relations(characterLikes, ({ one }) => ({
	user: one(users, {
		fields: [characterLikes.userId],
		references: [users.id],
	}),
	character: one(characters, {
		fields: [characterLikes.characterId],
		references: [characters.id],
	}),
}));

// Optional: Voices table (if you cache AI voices or have custom ones)
// export const voices = pgTable('voices', {
//     id: varchar('id', { length: 256 }).primaryKey().notNull(), // AI Studio voice ID or custom ID
//     name: varchar('name', { length: 256 }).notNull(),
//     type: varchar('type', { length: 50 }), // e.g., 'AI Studio', 'Custom'
//     description: varchar('description', { length: 512 }),
//     avatarUrl: varchar('avatar_url', { length: 256 }),
//     sampleAudioUrl: varchar('sample_audio_url', { length: 256 }),
//     platformVoiceId: varchar('platform_voice_id', { length: 256 }), // Actual ID used by the API
//     language: varchar('language', { length: 10 }),
//     gender: varchar('gender', { length: 20 }),
// });

// export const voicesRelations = relations(voices, ({ many }) => ({
//     characters: many(characters), // Characters use these voices
// }));

// Add relations to the characters schema if you add the voices table
// export const charactersRelations = relations(characters, ({ one, many }) => ({
//     creator: one(users, ...),
//     voice: one(voices, { // Link character to voice
//         fields: [characters.voiceId],
//         references: [voices.platformVoiceId], // Reference the actual ID used by the platform
//     }),
//     chatMessages: many(chatMessages),
//     characterLikes: many(characterLikes),
// }));

//////////////////////////////////
///////////////////////////////////
////////////////////////////////////
//For the call agents database schema
////////////////////////////////////
//////////////////////////////////
////////////////////////////////

// --- Call Agents Table ---
export const callAgents = pgTable("call_agents", {
	id: serial("id").primaryKey(),
	// Non-sequential public identifier used everywhere agents appear in a
	// URL (/callagents/<publicId>, /interview/<publicId>). Internal FKs in
	// agent_actions, calls, phone_numbers etc. continue to reference `id`.
	publicId: uuid("public_id").defaultRandom().notNull().unique(),
	creatorId: varchar("creator_id", { length: 256 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }), // Link to the user who created the agent

	name: varchar("name", { length: 256 }).notNull(),
	type: varchar("type", { length: 50 }).notNull(), // 'inbound', 'outbound' - from CreateAgentModal

	avatarUrl: varchar("avatar_url", { length: 256 }), // URL for agent's image (optional) - from GeneralConfig

	// Configuration fields derived from GeneralConfig
	voiceEngine: varchar("voice_engine", { length: 50 }), // 'v1', 'v2'
	aiModel: varchar("ai_model", { length: 50 }), // e.g., 'gpt4o', 'openai', etc.
	timezone: varchar("timezone", { length: 100 }), // Timezone string
	customVocabulary: jsonb("custom_vocabulary").default([]).notNull(), // Array of terms as JSONB
	useFillerWords: boolean("use_filler_words").notNull().default(true),

	// Prompt and Greeting derived from PromptPage
	prompt: text("prompt"), // The main AI prompt/system message
	greetingMessage: text("greeting_message"), // What the agent says first

	// Configuration grouped into JSONB columns for flexibility
	// Voice specific parameters from VoiceConfig
	// Example structure: { voiceId: '...', voiceName: '...', voiceProvider: '...', stability: 0.5, ... }
	voiceConfig: jsonb("voice_config").default({}).notNull(),
	// Call specific parameters from CallConfig
	// Example structure: { noiseCancellation: 'standard', maxIdleDuration: 15, ... }
	callConfig: jsonb("call_config").default({}).notNull(),

	// --- NEW: Recruitment & Marketplace Fields ---
    // Recruitment Specifics: { jobDescription: string, candidateLimit: number, expiryDate: string, antiCheatEnabled: boolean }
    recruitmentConfig: jsonb("recruitment_config").default({}).notNull(),
    
    // Marketplace Config: { isForSale: boolean, priceOwner: number, priceTrain: number, originalCreatorId: string, rating: number, usageCount: number }
    marketplaceConfig: jsonb("marketplace_config").default({ isForSale: false, usageCount: 0 }).notNull(),

    // Per-agent integration metadata that doesn't fit into agent_integrations rules.
    // Currently used by the Google Sheets integration to remember the linked
    // spreadsheet: { googleSheets: { spreadsheetId, spreadsheetUrl } }.
    integrationConfig: jsonb("integration_config").default({}).notNull(),


	// Knowledge Base Link
	knowledgeBaseId: integer("knowledge_base_id").references(
		() => knowledgeBases.id,
		{ onDelete: "set null" },
	), // Link to a KB, can be null - from GeneralConfig/PromptPage

	// Status (e.g., draft, active, paused, archived)
	status: varchar("status", { length: 50 }).notNull().default("draft"), // Implied lifecycle

	// Link to template if created from one (optional, commented out for now)
	// templateId: integer('template_id').references(() => agentTemplates.id, { onDelete: 'set null' }),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(), // From AgentTable lastEdited
});

// Relations for CallAgent
export const callAgentsRelations = relations(callAgents, ({ one, many }) => ({
	creator: one(users, {
		// Each agent belongs to one creator
		fields: [callAgents.creatorId],
		references: [users.id],
	}),
	knowledgeBase: one(knowledgeBases, {
		// Each agent can use one KB (optional)
		fields: [callAgents.knowledgeBaseId],
		references: [knowledgeBases.id],
	}),
	agentActions: many(agentActions), // An agent has many configured actions
	calls: many(calls), // An agent makes/receives many calls
	// template: one(agentTemplates, { // Link to template (if added later)
	//     fields: [callAgents.templateId],
	//     references: [agentTemplates.id],
	// }),
	interviews: many(interviews), // NEW Relation
    traineeProgress: many(traineeProgress), // NEW Relation
}));

// --- Global Actions Table (Reusable Actions/Variables) ---
// These are the definitions available in the "Add Action" modal on the global Actions page
export const actions = pgTable(
	"actions",
	{
		id: serial("id").primaryKey(),
		// creatorId is nullable for system/template actions sourced outside a specific user
		creatorId: varchar("creator_id", { length: 256 }).references(
			() => users.id,
			{ onDelete: "set null" },
		), // Link to the user who defined this action

		name: varchar("name", { length: 256 }).notNull(), // Variable name (e.g., 'first_name') - unique per creator/source
		displayName: varchar("display_name", { length: 256 }), // Human-readable name (e.g., 'Customer First Name') - from ActionCardList/ViewModal
		description: text("description"), // Explanation of the action - from ActionCardList/ViewModal

		type: varchar("type", { length: 50 }).notNull(), // Broad type: 'Information Extractor', 'Action Type' - from ActionCardList/ViewModal
		// Detailed configuration matching the UI creation modal: { type: 'Text'/'Boolean'/'Choice'/'Action', ...params }
		// Example: { type: 'Choice', options: [{ label: 'Pickup'}, { label: 'Delivery'}] } - from AddActionModal/ActionConfigForm
		config: jsonb("config").default({}).notNull(),

		// ***** NEW FIELD *****
		isRequired: boolean("is_required").notNull().default(true), // New field to mark action as required or optional

		source: varchar("source", { length: 50 }).notNull().default("custom"), // 'custom', 'template', 'system' - from ActionCardList/ViewModal

		// Timestamps
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => ({
		// Ensure action names are unique per creator (including null for system/template)
		unqCreatorName: uniqueIndex("action_creator_name_unq").on(
			t.creatorId,
			t.name,
		),
		// If name needs to be globally unique regardless of source, use:
		// unique_name_idx: uniqueIndex('action_name_unq').on(t.name),
	}),
);

// Relations for Action
export const actionsRelations = relations(actions, ({ one, many }) => ({
	creator: one(users, {
		// Each action definition belongs to one creator (optional)
		fields: [actions.creatorId],
		references: [users.id],
	}),
	agentActions: many(agentActions), // A global action definition can be used in many AgentActions
}));

// --- Agent Actions Table (Linking Agents to Global Actions with Timing) ---
// Represents an instance of a global action configured for a specific agent and timing
// This table powers the /[agentid]/actions page
export const agentActions = pgTable(
	"agent_actions",
	{
		id: serial("id").primaryKey(),
		agentId: integer("agent_id")
			.notNull()
			.references(() => callAgents.id, { onDelete: "cascade" }), // Link to the Call Agent
		actionId: integer("action_id")
			.notNull()
			.references(() => actions.id, { onDelete: "cascade" }), // Link to the global Action definition

		timing: varchar("timing", { length: 20 }).notNull(), // 'before', 'during', 'after' - from /[agentid]/actions page
		order: integer("order").default(0), // Order within the timing group

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(t) => ({
		// Ensure an agent doesn't have the same global action assigned to the same timing group more than once
		unqAgentActionTiming: uniqueIndex("agent_action_timing_unq").on(
			t.agentId,
			t.actionId,
			t.timing,
		),
	}),
);

// Relations for AgentAction
export const agentActionsRelations = relations(
	agentActions,
	({ one, many }) => ({
		agent: one(callAgents, {
			// Each AgentAction belongs to one agent
			fields: [agentActions.agentId],
			references: [callAgents.id],
		}),
		action: one(actions, {
			// Each AgentAction uses one global action definition
			fields: [agentActions.actionId],
			references: [actions.id],
		}),
		callActionValues: many(callActionValues), // An AgentAction instance can have many values extracted across different calls
	}),
);

// --- Knowledge Bases Table ---
export const knowledgeBases = pgTable("knowledge_bases", {
	id: serial("id").primaryKey(),
	// Non-sequential public identifier used in /callagents/knowledgebase/<publicId>.
	publicId: uuid("public_id").defaultRandom().notNull().unique(),
	creatorId: varchar("creator_id", { length: 256 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }), // Link to the user who owns the KB - from GeneralConfig/PromptPage/UseTemplateModal

	name: varchar("name", { length: 256 }).notNull(),
	description: text("description"),

	// Add the new isPublic column
	isPublic: boolean("is_public").notNull().default(false), // true if public, false if private

	// Content can be stored flexibly. Using jsonb for an array of text chunks or file references.
	// Derived from UseTemplateModal KB tab
	content: jsonb("content").default([]).notNull(), // e.g., [{ type: 'text', value: 'chunk1' }, { type: 'file', url: '...' }]

	status: varchar("status", { length: 50 }).notNull().default("processing"), // 'processing', 'ready', 'failed'

	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for KnowledgeBase
export const knowledgeBasesRelations = relations(
	knowledgeBases,
	({ one, many }) => ({
		creator: one(users, {
			// Each KB belongs to one creator
			fields: [knowledgeBases.creatorId],
			references: [users.id],
		}),
		callAgents: many(callAgents), // A KB can be used by many agents (optional link)
	}),
);

// --- Phone Books Table ---
// A user-curated set of "if the caller wants X, transfer to phone Y" entries.
// Entries are stored as JSONB so a single fetch returns the full book.
// Each entry: { id, number (E.164), condition, createdAt }
export const phoneBooks = pgTable(
	"phone_books",
	{
		id: serial("id").primaryKey(),
		publicId: uuid("public_id").defaultRandom().notNull().unique(),
		creatorId: varchar("creator_id", { length: 256 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		name: varchar("name", { length: 256 }).notNull(),
		description: text("description"),

		entries: jsonb("entries").default([]).notNull(),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => ({
		unqCreatorName: uniqueIndex("phone_book_creator_name_unq").on(
			t.creatorId,
			t.name,
		),
	}),
);

export const phoneBooksRelations = relations(phoneBooks, ({ one }) => ({
	creator: one(users, {
		fields: [phoneBooks.creatorId],
		references: [users.id],
	}),
}));

// --- Contacts Table ---
// Represents contacts that agents might call or who might call agents
// Implied by callerName/callerNumber in Call data and potentially a future Contacts page
export const contacts = pgTable(
	"contacts",
	{
		id: serial("id").primaryKey(),
		creatorId: varchar("creator_id", { length: 256 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }), // Link to the user who owns the contact

		firstName: varchar("first_name", { length: 256 }),
		lastName: varchar("last_name", { length: 256 }),
		phoneNumber: varchar("phone_number", { length: 256 }).notNull(), // E.164 format +15551234567 - Unique per creator
		email: varchar("email", { length: 256 }),

		// Flexible field for other contact details
		otherDetails: jsonb("other_details").default({}).notNull(),

		// Timestamps
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => ({
		// Ensure a phone number is unique for a given user
		unqCreatorPhoneNumber: uniqueIndex("contact_creator_phone_unq").on(
			t.creatorId,
			t.phoneNumber,
		),
	}),
);

// Relations for Contact
export const contactsRelations = relations(contacts, ({ one, many }) => ({
	creator: one(users, {
		// Each contact belongs to one creator
		fields: [contacts.creatorId],
		references: [users.id],
	}),
	calls: many(calls), // A contact can be involved in many calls
}));

// --- Calls Table ---
// Records a specific call made or received by an agent
// This table powers the /[agentid]/calls page
export const calls = pgTable("calls", {
	id: serial("id").primaryKey(),
	agentId: integer("agent_id")
		.notNull()
		.references(() => callAgents.id, { onDelete: "cascade" }), // Which agent handled the call - from CallsPage

	contactId: integer("contact_id").references(() => contacts.id, {
		onDelete: "set null",
	}), // Link to a contact (optional) - from CallsPage mock data
	phoneNumber: varchar("phone_number", { length: 256 }).notNull(), // The phone number involved - from CallsPage mock data

	direction: varchar("direction", { length: 20 }).notNull(), // 'inbound', 'outbound' - from CallsPage mock data
	status: varchar("status", { length: 50 }).notNull(), // 'initiated', 'in-progress', 'completed', 'failed', 'voicemail', etc. - from CallsPage mock data

	startTime: timestamp("start_time").notNull(), // from CallsPage mock data
	endTime: timestamp("end_time"), // Null if call is ongoing or failed early - from CallsPage mock data
	duration: integer("duration"), // Duration in seconds, null if not completed - from CallsPage mock data

	transcript: jsonb("transcript"), // Full conversation transcript (optional) - from TranscriptTab

	// ***** NEW FIELD *****
	summary: text("summary"), // AI-generated summary of the call (optional)

	isExported: boolean("is_exported").notNull().default(false),

	audioUrl: varchar("audio_url", { length: 256 }), // URL to recording (optional) - from TranscriptTab/DownloadDeleteTab

	// Store platform-specific call data if needed (e.g., Twilio SIDs)
	rawCallData: jsonb("raw_call_data"), // from CallsPage mock data

	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(), // Often same as startTime or slightly before
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for Call
export const callsRelations = relations(calls, ({ one, many }) => ({
	agent: one(callAgents, {
		// Each call belongs to one agent
		fields: [calls.agentId],
		references: [callAgents.id],
	}),
	contact: one(contacts, {
		// Each call can be linked to one contact (optional)
		fields: [calls.contactId],
		references: [contacts.id],
	}),
	callActionValues: many(callActionValues), // A call produces many extracted values
}));

// --- Call Action Values Table (Extracted data for actions during a call) ---
// Links a specific call to a specific configured action on the agent and stores the result
// This table stores the data shown in the ActionsDataTab
export const callActionValues = pgTable(
	"call_action_values",
	{
		id: serial("id").primaryKey(),
		callId: integer("call_id")
			.notNull()
			.references(() => calls.id, { onDelete: "cascade" }), // Link to the specific call
		agentActionId: integer("agent_action_id")
			.notNull()
			.references(() => agentActions.id, { onDelete: "cascade" }), // Link to the configured action instance on the agent

		// The extracted value - can be string, boolean, number, object, array depending on action config
		// Derived from actionsData in CallsPage mock data
		value: jsonb("value"),
		rawValue: text("raw_value"), // Optionally store the raw text segment AI processed

		extractedAt: timestamp("extracted_at").defaultNow().notNull(), // When the value was extracted
		confidence: integer("confidence"), // Optional confidence score (e.g., 0-100)
	},
	(t) => ({
		// Ensure only one extracted value for a specific action instance within a specific call
		unqCallAgentActionValue: uniqueIndex("call_agent_action_value_unq").on(
			t.callId,
			t.agentActionId,
		),
	}),
);

// Relations for CallActionValue
export const callActionValuesRelations = relations(
	callActionValues,
	({ one }) => ({
		call: one(calls, {
			// Each value belongs to one call
			fields: [callActionValues.callId],
			references: [calls.id],
		}),
		agentAction: one(agentActions, {
			// Each value corresponds to one configured action on the agent
			fields: [callActionValues.agentActionId],
			references: [agentActions.id],
		}),
	}),
);

/*
// --- Optional: Agent Templates Table (If implementing templates) ---
// Derived from CreateAgentModal and UseTemplateModal
export const agentTemplates = pgTable('agent_templates', {
    id: serial('id').primaryKey(),
    creatorId: varchar('creator_id', { length: 256 }).references(() => users.id, { onDelete: 'set null' }), // User who created it (or null for system templates)
    name: varchar('name', { length: 256 }).notNull(),
    description: text('description'),
    isPublic: boolean('is_public').notNull().default(false), // System templates might be public
    // Store default configs for agents created from this template
    // Could include default voiceConfig, callConfig, prompt, etc., mirroring CallAgent fields
    config: jsonb('config').default({}).notNull(),
    // Actions specific to the template could be stored here too, or in a separate templateActions table
    // templateActions: jsonb('template_actions'), // e.g. [{ actionId: 1, timing: 'after', order: 0 }]

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations for Agent Template (If added later)
// export const agentTemplatesRelations = relations(agentTemplates, ({ one, many }) => ({
//     creator: one(users, {
//         fields: [agentTemplates.creatorId],
//         references: [users.id],
//     }),
//     createdAgents: many(callAgents), // Agents created from this template
// }));
*/


// --- NEW: Interviews Table (Specialized calls with candidate data) ---
export const interviews = pgTable("interviews", {
    id: serial("id").primaryKey(),
    agentId: integer("agent_id").references(() => callAgents.id, { onDelete: "cascade" }), // Made nullable for magic link interviews

    // Can be linked to a registered user (Trainee) OR just an email (External Candidate)
    candidateId: varchar("candidate_id", { length: 256 }).references(() => users.id, { onDelete: "set null" }),
    candidateEmail: varchar("candidate_email", { length: 256 }),
    candidateName: varchar("candidate_name", { length: 256 }),

    // New fields for magic link interviews and extended candidate info
    linkId: varchar("link_id", { length: 256 }), // Reference to interview_links.linkId
    positionId: varchar("position_id", { length: 13 }).references(() => jobPositions.id, { onDelete: "set null" }),
    candidatePhone: varchar("candidate_phone", { length: 256 }),
    portfolioUrl: varchar("portfolio_url", { length: 256 }),
    linkedinUrl: varchar("linkedin_url", { length: 256 }),
    experience: varchar("experience", { length: 50 }),
    country: varchar("country", { length: 256 }),

    type: varchar("type", { length: 50 }).notNull().default("real_application"), // 'real_application' | 'mock_training'

    fitScore: integer("fit_score"), // 0-100

    // Detailed analysis JSON: { summary: string, strengths: [], weaknesses: [], topicScores: { "Tech": 90, "Soft": 50 } }
    analysisData: jsonb("analysis_data").default({}).notNull(),

    // Array of screenshot URLs from Firebase
    screenshots: jsonb("screenshots").default([]).notNull(),

    transcript: jsonb("transcript"),
    audioUrl: varchar("audio_url", { length: 256 }),

    status: varchar("status", { length: 50 }).default("pending"), // pending, ongoing, completed, reviewed

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => new Date())
        .notNull(),
});

export const interviewsRelations = relations(interviews, ({ one }) => ({
    agent: one(callAgents, {
        fields: [interviews.agentId],
        references: [callAgents.id],
    }),
    candidate: one(users, {
        fields: [interviews.candidateId],
        references: [users.id],
    }),
    position: one(jobPositions, {
        fields: [interviews.positionId],
        references: [jobPositions.id],
    }),
}));

// --- NEW: Job Positions Table ---
export const jobPositions = pgTable("job_positions", {
    id: varchar("id", { length: 13 }).primaryKey().$defaultFn(() => {
        const { generateSecureId } = require('./../../lib/utils/crypto.js');
        return generateSecureId();
    }),
    recruiterId: varchar("recruiter_id", { length: 256 }),
    userId: varchar("user_id", { length: 256 }),

    title: varchar("title", { length: 256 }).notNull(),
    department: varchar("department", { length: 256 }),
    description: text("description").notNull(),
    evaluationDescription: text("evaluation_description"), // Evaluation description for scoring criteria
    location: varchar("location", { length: 256 }),
    employmentType: varchar("employment_type", { length: 50 }), // 'full-time', 'part-time', 'contract', 'internship'
    language: varchar("language", { length: 50 }).default("English"), // Language for the position/interview
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    // Registration Setup Fields
    registrationStartDate: timestamp("registration_start_date"),
    registrationEndDate: timestamp("registration_end_date"),
    jobPosition: varchar("job_position", { length: 256 }), // Specific role/position title
    requiredExperience: varchar("required_experience", { length: 50 }), // Required years of experience

    // Interview Configuration
    questionCount: integer("question_count").default(8), // Number of questions
    duration: integer("duration").default(30), // minutes
    antiCheatEnabled: boolean("anti_cheat_enabled").default(true),

    // AI Configuration
    aiQuestions: jsonb("ai_questions").default([]), // Generated questions
    interviewer: varchar("interviewer", { length: 20 }).default("gemini"), // AI interviewer type
    voiceProvider: varchar("voice_provider", { length: 50 }).default("vapi"),
    voiceId: varchar("voice_id", { length: 256 }).default("monitor"),
    systemPrompt: text("system_prompt"),
    agentName: varchar("agent_name", { length: 256 }).default("Viktor"),
    tone: varchar("tone", { length: 50 }).default("Friendly"),
    evaluationCriteria: jsonb("evaluation_criteria").default([]), // Evaluation criteria array
    candidateEvaluation: text("candidate_evaluation"), // Candidate evaluation data

    // Pricing and Access
    price: integer("price").default(50),
    accessType: varchar("access_type", { length: 50 }).default("Public (Anyone)"),

    status: varchar("status", { length: 50 }).default("draft"), // 'draft', 'active', 'closed'

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => new Date())
        .notNull(),
});

// --- NEW: Interview Links Table (Magic Links) ---
export const interviewLinks = pgTable("interview_links", {
    id: serial("id").primaryKey(),
    positionId: varchar("position_id", { length: 13 })
        .notNull()
        .references(() => jobPositions.id, { onDelete: "cascade" }),

    linkId: varchar("link_id", { length: 256 }).notNull().unique(), // Magic link identifier
    customUrl: varchar("custom_url", { length: 256 }), // Optional custom URL

    // Link settings
    maxUses: integer("max_uses").default(1),
    currentUses: integer("current_uses").default(0),
    expiresAt: timestamp("expires_at"),

    // Access control
    requirePassword: boolean("require_password").default(false),
    password: varchar("password", { length: 256 }),

    status: varchar("status", { length: 50 }).default("active"), // 'active', 'expired', 'disabled'

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- NEW: Candidate Applications Table ---
export const candidateApplications = pgTable("candidate_applications", {
    id: serial("id").primaryKey(),
    positionId: varchar("position_id", { length: 13 })
        .notNull()
        .references(() => jobPositions.id, { onDelete: "cascade" }),

    // Candidate info (can be registered user or external)
    candidateId: varchar("candidate_id", { length: 256 }).references(() => users.id, { onDelete: "set null" }),
    publicId: varchar("public_id", { length: 256 }).notNull(), // Public identifier for external candidates
    candidateName: varchar("candidate_name", { length: 256 }).notNull(),
    candidateEmail: varchar("candidate_email", { length: 256 }).notNull(),
    candidatePhone: varchar("candidate_phone", { length: 256 }),

    // Application details
    portfolioUrl: varchar("portfolio_url", { length: 256 }),
    linkedinUrl: varchar("linkedin_url", { length: 256 }),
    experience: varchar("experience", { length: 50 }),
    country: varchar("country", { length: 256 }),
    address: text("address"), // Full address

    // CV/Resume text content (up to 3000 characters)
    cv: text("cv"), // Text version of CV/resume

    // Candidate interview data
    candidateInterview: text("candidate_interview"), // Interview-related text data
    interviewTaken: boolean("interview_taken").default(false).notNull(), // Whether interview has been taken

    // Application evaluation fields
    isRejected: boolean("is_rejected").default(false).notNull(),
    rejectReason: text("reject_reason"), // Reason for rejection
    result: jsonb("result"), // Evaluation results array with scores
    reasonResult: text("reason_result"), // Detailed reason for the result

    // Anti-cheat snapshots captured during the interview. Array of
    // { url: string, capturedAt: ISO-string }. 10 images per attempt.
    snapshotUrls: jsonb("snapshot_urls").default([]),

    // Application status
    status: varchar("status", { length: 50 }).default("applied"), // 'applied', 'screening', 'interviewing', 'offered', 'rejected', 'hired'

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => new Date())
        .notNull(),
});

// Relations for new tables
export const jobPositionsRelations = relations(jobPositions, ({ one, many }) => ({
    recruiter: one(users, {
        fields: [jobPositions.recruiterId],
        references: [users.id],
    }),
    interviews: many(interviews),
    links: many(interviewLinks),
    applications: many(candidateApplications),
}));

export const interviewLinksRelations = relations(interviewLinks, ({ one, many }) => ({
    position: one(jobPositions, {
        fields: [interviewLinks.positionId],
        references: [jobPositions.id],
    }),
}));

export const candidateApplicationsRelations = relations(candidateApplications, ({ one, many }) => ({
    position: one(jobPositions, {
        fields: [candidateApplications.positionId],
        references: [jobPositions.id],
    }),
    candidate: one(users, {
        fields: [candidateApplications.candidateId],
        references: [users.id],
    }),
}));

// --- NEW: Recruiter Activities Table ---
// Lightweight feed of "register" and "interview_taken" events scoped to a
// recruiter. Powers the Recent Activity panel on the recruiter dashboard so
// the recruiter sees who registered and who actually took the interview
// without re-deriving it from candidate_applications + interviews on each
// load.
export const recruiterActivities = pgTable("recruiter_activities", {
    id: serial("id").primaryKey(),
    recruiterId: varchar("recruiter_id", { length: 256 }).notNull(),
    positionId: varchar("position_id", { length: 13 }),
    applicationId: integer("application_id"),

    // 'registered' | 'interview_taken'
    type: varchar("type", { length: 32 }).notNull(),

    candidateName: varchar("candidate_name", { length: 256 }),
    candidateEmail: varchar("candidate_email", { length: 256 }),
    positionTitle: varchar("position_title", { length: 256 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Update existing relations
export const usersRelations = relations(users, ({ many }) => ({
	characters: many(characters),
	chatMessages: many(chatMessages),
	characterLikes: many(characterLikes),
	voices: many(voices),
	callAgents: many(callAgents),
    traineeProgress: many(traineeProgress),
	interviews: many(interviews),
    jobPositions: many(jobPositions), // NEW
    candidateApplications: many(candidateApplications), // NEW
    tokenTransactions: many(tokenTransactions),
}));

// --- NEW: Trainee Progress Table (Gamification) ---
export const traineeProgress = pgTable("trainee_progress", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    agentId: integer("agent_id")
        .notNull()
        .references(() => callAgents.id, { onDelete: "cascade" }),

    totalXp: integer("total_xp").default(0).notNull(),
    level: integer("level").default(1).notNull(),

    quizScores: jsonb("quiz_scores").default([]).notNull(), // History of quiz results [{date, score, count}]

    lastTrainedAt: timestamp("last_trained_at"),
});

export const traineeProgressRelations = relations(traineeProgress, ({ one }) => ({
    user: one(users, {
        fields: [traineeProgress.userId],
        references: [users.id],
    }),
    agent: one(callAgents, {
        fields: [traineeProgress.agentId],
        references: [callAgents.id],
    }),
}));

// --- NEW: Trainee Interview Table (single table for all trainee interview data) ---
// Stores interview definition + per-attempt transcripts/results in JSONB so a
// trainee can take the same interview many times. transcripts, results, and
// resultReasons share the same attempt-id keys.
export const traineeInterviews = pgTable("trainee_interviews", {
    id: varchar("id", { length: 12 }).primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull(),

    // Step 0 – Setup
    title: varchar("title", { length: 256 }).notNull(),
    duration: integer("duration").default(30),
    questionCount: integer("question_count").default(8),
    department: varchar("department", { length: 256 }),
    language: varchar("language", { length: 50 }).default("English"),
    experienceLevel: varchar("experience_level", { length: 50 }),

    // Step 1 – Description
    description: text("description"),

    // Step 3 – AI generated (hidden from user)
    systemPrompt: text("system_prompt"),
    aiQuestions: jsonb("ai_questions").default([]),
    recommendation: text("recommendation"),

    // Step 4 – Agent / voice config
    evaluationCriteria: jsonb("evaluation_criteria").default([]),
    voiceProvider: varchar("voice_provider", { length: 50 }).default("vapi"),
    voiceId: varchar("voice_id", { length: 256 }).default("monitor"),
    agentName: varchar("agent_name", { length: 256 }).default("Viktor"),
    tone: varchar("tone", { length: 50 }).default("Friendly"),
    interviewer: varchar("interviewer", { length: 20 }).default("vapi"),

    // Per-attempt JSON stores. Keys are attempt ids (nanoid-12); the same key
    // appears across all three columns.
    // transcripts: { [attemptId]: { transcript: [...], startedAt, endedAt } }
    // results:     { [attemptId]: { general: {...}, specific: {...} } }
    // resultReasons: { [attemptId]: { reasons: [...] | string } }
    transcripts: jsonb("transcripts").default({}),
    results: jsonb("results").default({}),
    resultReasons: jsonb("result_reasons").default({}),

    status: varchar("status", { length: 50 }).default("draft"), // draft | active

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => new Date())
        .notNull(),
});

export const traineeInterviewsRelations = relations(traineeInterviews, ({ one }) => ({
    user: one(users, {
        fields: [traineeInterviews.userId],
        references: [users.id],
    }),
}));

// --- NEW: Trainee Quiz Attempts Table ---
// Quizzes are taken from a TraineeInterview (the same prompt + questions
// powers both the spoken interview and a paper quiz). interviewId references
// the parent traineeInterviews.id.
export const traineeQuizAttempts = pgTable("trainee_quiz_attempts", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    interviewId: varchar("interview_id", { length: 12 }), // FK-style ref to trainee_interviews.id
    agentId: integer("agent_id"), // legacy: optional link to callAgents
    title: varchar("title", { length: 256 }),
    score: integer("score").default(0),
    total: integer("total").default(0),
    questions: jsonb("questions").default([]),
    answers: jsonb("answers").default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const traineeQuizAttemptsRelations = relations(traineeQuizAttempts, ({ one }) => ({
    user: one(users, {
        fields: [traineeQuizAttempts.userId],
        references: [users.id],
    }),
}));

// =================================================================
// 1. TABLE FOR USER CONNECTIONS (e.g., Storing an ElevenLabs API Key)
// =================================================================
// This table securely stores the credentials a user provides to connect
// their account to a third-party service like ElevenLabs or Twilio.
export const userConnections = pgTable(
	"user_connections",
	{
		id: serial("id").primaryKey(),
		userId: varchar("user_id", { length: 256 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		// The provider name, e.g., 'elevenlabs', 'google', 'twilio'
		provider: varchar("provider", { length: 50 }).notNull(),

		// The encrypted access token or API key.
		// Storing sensitive data like this should always be encrypted at rest.
		encryptedAccessToken: text("encrypted_access_token").notNull(),

		// Timestamps
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => ({
		// A user can only have one connection per provider.
		unqUserProvider: uniqueIndex("user_provider_unq").on(t.userId, t.provider),
	}),
);

// =================================================================
// 2. TABLE FOR YOUR PLATFORM'S API KEYS
// =================================================================
// This table stores the API keys that YOUR platform issues to users
// so they can interact with your API (as seen on the API Keys page).
export const apiKeys = pgTable("api_keys", {
	id: serial("id").primaryKey(),
	userId: varchar("user_id", { length: 256 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),

	// A user-friendly name for the key.
	name: varchar("name", { length: 256 }).notNull(),

	// We store a HASH of the key, not the key itself. This is a critical security practice.
	// We only show the user the full key once upon creation.
	hashedKey: varchar("hashed_key", { length: 256 }).notNull().unique(),

	// We can show the user the first few characters to help them identify keys.
	keyPreview: varchar("key_preview", { length: 10 }).notNull(),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	lastUsedAt: timestamp("last_used_at"),
});

// =================================================================
// 3. TABLE FOR VOICES (To be populated by ElevenLabs)
// =================================================================
// This table will store a list of all available voices, both system-wide
// default voices and custom voices synced from a user's integration.
export const voices = pgTable(
	"voices",
	{
		id: serial("id").primaryKey(),

		// If creatorId is NULL, it's a system-wide default voice.
		// If it has a userId, it's a custom voice belonging to that user.
		creatorId: varchar("creator_id", { length: 256 }).references(
			() => users.id,
			{ onDelete: "cascade" },
		),

		// The actual voice_id from the provider (e.g., ElevenLabs).
		providerVoiceId: varchar("provider_voice_id", { length: 256 }).notNull(),
		provider: varchar("provider", { length: 50 }).notNull(), // 'elevenlabs', 'vapi', etc.

		name: varchar("name", { length: 256 }).notNull(),
		description: text("description"),

		// URLs for avatar and audio samples provided by the platform.
		avatarUrl: varchar("avatar_url", { length: 256 }),
		sampleAudioUrl: varchar("sample_audio_url", { length: 256 }),

		// Additional metadata from the provider.
		category: varchar("category", { length: 50 }), // e.g., 'cloned', 'premade', 'generated'

		// Is this voice publicly available to all users on the platform? (For default voices)
		isPublic: boolean("is_public").notNull().default(false),

		// Timestamps
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(t) => ({
		// Ensures a user can't have duplicate voices from the same provider.
		unqUserProviderVoice: uniqueIndex("user_provider_voice_unq").on(
			t.creatorId,
			t.provider,
			t.providerVoiceId,
		),
	}),
);

// Define relations for the new voices table
export const voicesRelations = relations(voices, ({ one }) => ({
	// This defines a "belongs-to" relationship.
	// Each voice can optionally belong to one creator (user).
	creator: one(users, {
		fields: [voices.creatorId],
		references: [users.id],
	}),
}));


// --- SDK & EMBEDDED AI TABLES ---

// Represents the Developer's integrated App
export const sdkApps = pgTable('sdk_apps', {
    id: serial('id').primaryKey(),
    // Non-sequential public identifier used in /callagents/embedded/<publicId>.
    publicId: uuid('public_id').defaultRandom().notNull().unique(),
    creatorId: text('creator_id').notNull(), // Assuming users.id is text (Better Auth). Add references(() => users.id) if applicable.
    agentId: integer('agent_id').references(() => callAgents.id, { onDelete: 'set null' }), // Links to the Alan AI agent's voice/prompt config
    name: text('name').notNull(), // e.g., "My Restaurant App"
    publicKey: text('public_key').notNull().unique(), // e.g., 'dw_pk_live_8f72k...' (Visible in frontend)
    domainWhitelist: jsonb('domain_whitelist').default([]), // e.g., ['localhost:3000', 'myrestaurant.com']
    status: text('status').default('active'), // 'active', 'paused'

    // 'agent' (use linked callAgents row) | 'custom' (use the fields below)
    mode: varchar('mode', { length: 20 }).default('agent'),
    customPrompt: text('custom_prompt'),
    customVoiceId: varchar('custom_voice_id', { length: 50 }), // Gemini voice name e.g. 'Aoede', 'Puck'
    customKnowledgeBaseId: integer('custom_knowledge_base_id').references(() => knowledgeBases.id, { onDelete: 'set null' }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Represents the versioned snapshot of what the dev's code can do
export const sdkManifests = pgTable('sdk_manifests', {
    id: serial('id').primaryKey(),
    appId: integer('app_id').notNull().references(() => sdkApps.id, { onDelete: 'cascade' }),
    version: integer('version').notNull().default(1),
    environment: text('environment').default('development'), // 'development', 'staging', 'production'
    actions: jsonb('actions').default([]), // Array of tool schemas [{ name: 'orderPizza', description: '...' }]
    stateSchema: jsonb('state_schema').default({}), // Structure of the data the UI will pass up
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const sdkAppsRelations = relations(sdkApps, ({ one, many }) => ({
    agent: one(callAgents, {
        fields: [sdkApps.agentId],
        references: [callAgents.id],
    }),
    manifests: many(sdkManifests),
}));

export const sdkManifestsRelations = relations(sdkManifests, ({ one }) => ({
    app: one(sdkApps, {
        fields: [sdkManifests.appId],
        references: [sdkApps.id],
    }),
}));


// =================================================================
// PHASE A: PER-AGENT THIRD-PARTY DESTINATION INTEGRATIONS
// (Slack / Telegram / Email — fan-out from post-call extraction)
// =================================================================

// Reusable message templates (per-user library). Bound to a destination type
// because Slack uses Block Kit, Telegram uses MarkdownV2, Email is HTML — the
// renderer needs to know which target it's producing for.
export const messageTemplates = pgTable(
    "message_templates",
    {
        id: serial("id").primaryKey(),
        userId: varchar("user_id", { length: 256 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        name: varchar("name", { length: 256 }).notNull(),
        // 'slack' | 'telegram' | 'email'
        destination: varchar("destination", { length: 50 }).notNull(),

        // For email only. Title/heading for Slack/Telegram is part of body.
        subject: text("subject"),
        // The user-authored template body with {{variable}} placeholders.
        // For Slack we additionally render this into Block Kit. Telegram uses
        // MarkdownV2. Email wraps it in an HTML shell.
        body: text("body").notNull(),

        // Whether this is a system-provided default (not editable, cloneable).
        isDefault: boolean("is_default").notNull().default(false),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
);

export const messageTemplatesRelations = relations(messageTemplates, ({ one, many }) => ({
    user: one(users, {
        fields: [messageTemplates.userId],
        references: [users.id],
    }),
    agentIntegrations: many(agentIntegrations),
}));

// Per-agent integration *rule*. One agent can have many — e.g. send to #leads
// in Slack AND to support@ via Email when an action is extracted.
export const agentIntegrations = pgTable(
    "agent_integrations",
    {
        id: serial("id").primaryKey(),
        agentId: integer("agent_id")
            .notNull()
            .references(() => callAgents.id, { onDelete: "cascade" }),

        // 'slack' | 'telegram' | 'email' (mirrors userConnections.provider)
        provider: varchar("provider", { length: 50 }).notNull(),

        // Friendly label shown in the UI ("New leads to #sales")
        name: varchar("name", { length: 256 }).notNull(),
        enabled: boolean("enabled").notNull().default(true),

        // Provider-specific destination config.
        //   slack:    { channelId: 'C0123', channelName: '#leads' }
        //   telegram: { chatId: '-123456' }
        //   email:    { to: 'a@x.com,b@y.com', cc: '', bcc: '' }
        destinationConfig: jsonb("destination_config").default({}).notNull(),

        // Optional template — null falls back to a sensible default
        templateId: integer("template_id").references(
            () => messageTemplates.id,
            { onDelete: "set null" },
        ),

        // Conditional: only fire if these action filters match.
        // Shape: { mode: 'all_calls' | 'has_actions' | 'condition',
        //          requiredActions: ['action_name'],   // when 'has_actions'
        //          condition: { actionName: 'order_type', equals: 'Pickup' } }
        filter: jsonb("filter").default({ mode: "all_calls" }).notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
);

export const agentIntegrationsRelations = relations(agentIntegrations, ({ one, many }) => ({
    agent: one(callAgents, {
        fields: [agentIntegrations.agentId],
        references: [callAgents.id],
    }),
    template: one(messageTemplates, {
        fields: [agentIntegrations.templateId],
        references: [messageTemplates.id],
    }),
    dispatchLogs: many(integrationDispatchLog),
}));

// Audit log of every dispatch attempt — visible to user so they understand
// why a message did or didn't go out. Critical for "actually works" UX.
export const integrationDispatchLog = pgTable("integration_dispatch_log", {
    id: serial("id").primaryKey(),
    agentIntegrationId: integer("agent_integration_id")
        .notNull()
        .references(() => agentIntegrations.id, { onDelete: "cascade" }),
    callId: integer("call_id").references(() => calls.id, { onDelete: "set null" }),

    // 'success' | 'failed' | 'skipped'  (skipped when filter rejected the call)
    status: varchar("status", { length: 20 }).notNull(),
    // Provider response code or skip reason. Free-form for debugging.
    detail: text("detail"),
    // Snapshot of what was actually sent (rendered body etc.) for audit.
    payload: jsonb("payload"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const integrationDispatchLogRelations = relations(integrationDispatchLog, ({ one }) => ({
    agentIntegration: one(agentIntegrations, {
        fields: [integrationDispatchLog.agentIntegrationId],
        references: [agentIntegrations.id],
    }),
    call: one(calls, {
        fields: [integrationDispatchLog.callId],
        references: [calls.id],
    }),
}));


// =================================================================
// PHASE C: PHONE NUMBERS (Twilio + Vapi)
// =================================================================
// User-owned phone numbers, imported from Twilio or hosted directly on Vapi.
// One number can be assigned to at most one agent at a time. The provider
// columns hold the upstream IDs so we can talk to Twilio/Vapi later.

export const phoneNumbers = pgTable(
    "phone_numbers",
    {
        id: serial("id").primaryKey(),
        userId: varchar("user_id", { length: 256 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        // 'twilio' | 'vapi'
        provider: varchar("provider", { length: 20 }).notNull(),
        // E.164 format: +15551234567
        e164: varchar("e164", { length: 32 }).notNull(),
        // Friendly name shown in the UI ("Main line").
        friendlyName: varchar("friendly_name", { length: 256 }),

        // Capabilities reported by the provider: { voice, sms, mms, fax }
        capabilities: jsonb("capabilities").default({}).notNull(),

        // Upstream provider IDs.
        //   twilioSid:    SID from Twilio (PNxxxxxxxx)
        //   vapiNumberId: id of the imported/native number on Vapi
        providerIds: jsonb("provider_ids").default({}).notNull(),

        // Which agent (if any) currently uses this number for inbound calls.
        assignedAgentId: integer("assigned_agent_id").references(
            () => callAgents.id,
            { onDelete: "set null" },
        ),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => ({
        unqUserNumber: uniqueIndex("phone_user_e164_unq").on(t.userId, t.e164),
    }),
);

export const phoneNumbersRelations = relations(phoneNumbers, ({ one }) => ({
    user: one(users, {
        fields: [phoneNumbers.userId],
        references: [users.id],
    }),
    assignedAgent: one(callAgents, {
        fields: [phoneNumbers.assignedAgentId],
        references: [callAgents.id],
    }),
}));

// --- Token Transactions Table ---
// Tracks every token debit/credit for recruiter and trainee users.
export const tokenTransactions = pgTable("token_transactions", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    // 'usage' (interview cost) | 'purchase' (top-up) | 'bonus' (gift)
    type: varchar("type", { length: 32 }).notNull().default("usage"),
    // Negative for debits, positive for credits
    amount: integer("amount").notNull(),
    description: text("description"),
    durationMinutes: integer("duration_minutes"),
    // 'trainee' | 'recruiter'
    interviewType: varchar("interview_type", { length: 32 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tokenTransactionsRelations = relations(tokenTransactions, ({ one }) => ({
    user: one(users, {
        fields: [tokenTransactions.userId],
        references: [users.id],
    }),
}));