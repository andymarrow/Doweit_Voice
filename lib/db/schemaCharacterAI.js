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
    jsonb
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"; // Import relations for defining relationships

// Users table (linked to Clerk user ID)
export const users = pgTable('users', {
    // Use Clerk's userId as the primary key
    id: varchar('id', { length: 256 }).primaryKey().notNull(),
    // Store some basic user info from Clerk
    username: varchar('username', { length: 256 }),
    email: varchar('email', { length: 256 }),
    profileImageUrl: varchar('profile_image_url', { length: 256 }),
    // Add timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations for users (e.g., user creates characters)
export const usersRelations = relations(users, ({ many }) => ({
    characters: many(characters),
    chatMessages: many(chatMessages), // A user sends many messages
    characterLikes: many(characterLikes), // A user can like many characters
}));


// Characters table
export const characters = pgTable('characters', {
    id: serial('id').primaryKey(),
    // Link to the user who created the character
    creatorId: varchar('creator_id', { length: 256 }).notNull().references(() => users.id, { onDelete: 'cascade' }), // Cascade delete characters if user is deleted
    name: varchar('name', { length: 256 }).notNull(),
    tagline: varchar('tagline', { length: 256 }),
    description: text('description').notNull(), // Use text for longer content
    greeting: text('greeting').notNull(), // Use text for longer content
    avatarUrl: varchar('avatar_url', { length: 256 }), // Firebase Storage URL
    // AI Voice details
    voiceId: varchar('voice_id', { length: 256 }), // AI Studio platform voice ID (e.g., 'Zephyr')
    voiceName: varchar('voice_name', { length: 256 }), // Friendly name
    voiceProvider: varchar('voice_provider', { length: 50 }).notNull(),
    // Language constraint
    language: varchar('language', { length: 10 }).notNull().default('en'), // e.g., 'en', 'am'
    // Behavior tags
    behavior: json('behavior'), // Store as JSON array of strings
    // Visibility
    isPublic: boolean('is_public').notNull().default(true),
    // Engagement metrics
    likes: integer('likes').notNull().default(0),
    chats: integer('chats').notNull().default(0),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
export const chatMessages = pgTable('chat_messages', {
    id: serial('id').primaryKey(),
    // Unique identifier for a specific chat session (user + character combination)
    // This allows grouping messages for context
    chatSessionId: varchar('chat_session_id', { length: 256 }).notNull(), // e.g., "clerkUserId_characterId"
    userId: varchar('user_id', { length: 256 }).notNull().references(() => users.id, { onDelete: 'cascade' }), // Link to the user who sent/received
    characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }), // Link to the character
    sender: varchar('sender', { length: 10 }).notNull(), // 'user' or 'character'
    text: text('text').notNull(), // Message text
    audioUrl: varchar('audio_url', { length: 256 }), // URL to AI character's audio response (if generated/stored)
    timestamp: timestamp('timestamp').defaultNow().notNull(), // When the message was sent/received
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
export const characterLikes = pgTable('character_likes', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 256 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
    characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    // Ensure a user can only like a character once
    unqUserCharacter: uniqueIndex('user_character_unq').on(t.userId, t.characterId),
}));

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
export const callAgents = pgTable('call_agents', {
    id: serial('id').primaryKey(),
    creatorId: varchar('creator_id', { length: 256 }).notNull().references(() => users.id, { onDelete: 'cascade' }), // Link to the user who created the agent

    name: varchar('name', { length: 256 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'inbound', 'outbound' - from CreateAgentModal

    avatarUrl: varchar('avatar_url', { length: 256 }), // URL for agent's image (optional) - from GeneralConfig

    // Configuration fields derived from GeneralConfig
    voiceEngine: varchar('voice_engine', { length: 50 }), // 'v1', 'v2'
    aiModel: varchar('ai_model', { length: 50 }), // e.g., 'gpt4o', 'openai', etc.
    timezone: varchar('timezone', { length: 100 }), // Timezone string
    customVocabulary: jsonb('custom_vocabulary').default([]).notNull(), // Array of terms as JSONB
    useFillerWords: boolean('use_filler_words').notNull().default(true),

    // Prompt and Greeting derived from PromptPage
    prompt: text('prompt'), // The main AI prompt/system message
    greetingMessage: text('greeting_message'), // What the agent says first

    // Configuration grouped into JSONB columns for flexibility
    // Voice specific parameters from VoiceConfig
    // Example structure: { voiceId: '...', voiceName: '...', voiceProvider: '...', stability: 0.5, ... }
    voiceConfig: jsonb('voice_config').default({}).notNull(),
    // Call specific parameters from CallConfig
    // Example structure: { noiseCancellation: 'standard', maxIdleDuration: 15, ... }
    callConfig: jsonb('call_config').default({}).notNull(),

    // Knowledge Base Link
    knowledgeBaseId: integer('knowledge_base_id').references(() => knowledgeBases.id, { onDelete: 'set null' }), // Link to a KB, can be null - from GeneralConfig/PromptPage

    // Status (e.g., draft, active, paused, archived)
    status: varchar('status', { length: 50 }).notNull().default('draft'), // Implied lifecycle

    // Link to template if created from one (optional, commented out for now)
    // templateId: integer('template_id').references(() => agentTemplates.id, { onDelete: 'set null' }),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(), // From AgentTable lastEdited
});

// Relations for CallAgent
export const callAgentsRelations = relations(callAgents, ({ one, many }) => ({
    creator: one(users, { // Each agent belongs to one creator
        fields: [callAgents.creatorId],
        references: [users.id],
    }),
    knowledgeBase: one(knowledgeBases, { // Each agent can use one KB (optional)
        fields: [callAgents.knowledgeBaseId],
        references: [knowledgeBases.id],
    }),
    agentActions: many(agentActions), // An agent has many configured actions
    calls: many(calls), // An agent makes/receives many calls
    // template: one(agentTemplates, { // Link to template (if added later)
    //     fields: [callAgents.templateId],
    //     references: [agentTemplates.id],
    // }),
}));


// --- Global Actions Table (Reusable Actions/Variables) ---
// These are the definitions available in the "Add Action" modal on the global Actions page
export const actions = pgTable('actions', {
    id: serial('id').primaryKey(),
    // creatorId is nullable for system/template actions sourced outside a specific user
    creatorId: varchar('creator_id', { length: 256 }).references(() => users.id, { onDelete: 'set null' }), // Link to the user who defined this action

    name: varchar('name', { length: 256 }).notNull(), // Variable name (e.g., 'first_name') - unique per creator/source
    displayName: varchar('display_name', { length: 256 }), // Human-readable name (e.g., 'Customer First Name') - from ActionCardList/ViewModal
    description: text('description'), // Explanation of the action - from ActionCardList/ViewModal

    type: varchar('type', { length: 50 }).notNull(), // Broad type: 'Information Extractor', 'Action Type' - from ActionCardList/ViewModal
    // Detailed configuration matching the UI creation modal: { type: 'Text'/'Boolean'/'Choice'/'Action', ...params }
    // Example: { type: 'Choice', options: [{ label: 'Pickup'}, { label: 'Delivery'}] } - from AddActionModal/ActionConfigForm
    config: jsonb('config').default({}).notNull(),

    source: varchar('source', { length: 50 }).notNull().default('custom'), // 'custom', 'template', 'system' - from ActionCardList/ViewModal

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    // Ensure action names are unique per creator (including null for system/template)
    unqCreatorName: uniqueIndex('action_creator_name_unq').on(t.creatorId, t.name),
    // If name needs to be globally unique regardless of source, use:
    // unique_name_idx: uniqueIndex('action_name_unq').on(t.name),
}));

// Relations for Action
export const actionsRelations = relations(actions, ({ one, many }) => ({
    creator: one(users, { // Each action definition belongs to one creator (optional)
        fields: [actions.creatorId],
        references: [users.id],
    }),
    agentActions: many(agentActions), // A global action definition can be used in many AgentActions
}));


// --- Agent Actions Table (Linking Agents to Global Actions with Timing) ---
// Represents an instance of a global action configured for a specific agent and timing
// This table powers the /[agentid]/actions page
export const agentActions = pgTable('agent_actions', {
    id: serial('id').primaryKey(),
    agentId: integer('agent_id').notNull().references(() => callAgents.id, { onDelete: 'cascade' }), // Link to the Call Agent
    actionId: integer('action_id').notNull().references(() => actions.id, { onDelete: 'cascade' }), // Link to the global Action definition

    timing: varchar('timing', { length: 20 }).notNull(), // 'before', 'during', 'after' - from /[agentid]/actions page
    order: integer('order').default(0), // Order within the timing group

    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    // Ensure an agent doesn't have the same global action assigned to the same timing group more than once
    unqAgentActionTiming: uniqueIndex('agent_action_timing_unq').on(t.agentId, t.actionId, t.timing),
}));

// Relations for AgentAction
export const agentActionsRelations = relations(agentActions, ({ one, many }) => ({
    agent: one(callAgents, { // Each AgentAction belongs to one agent
        fields: [agentActions.agentId],
        references: [callAgents.id],
    }),
    action: one(actions, { // Each AgentAction uses one global action definition
        fields: [agentActions.actionId],
        references: [actions.id],
    }),
    callActionValues: many(callActionValues), // An AgentAction instance can have many values extracted across different calls
}));


// --- Knowledge Bases Table ---
export const knowledgeBases = pgTable('knowledge_bases', {
    id: serial('id').primaryKey(),
    creatorId: varchar('creator_id', { length: 256 }).notNull().references(() => users.id, { onDelete: 'cascade' }), // Link to the user who owns the KB - from GeneralConfig/PromptPage/UseTemplateModal

    name: varchar('name', { length: 256 }).notNull(),
    description: text('description'),

    // Add the new isPublic column
    isPublic: boolean('is_public').notNull().default(false), // true if public, false if private

    // Content can be stored flexibly. Using jsonb for an array of text chunks or file references.
    // Derived from UseTemplateModal KB tab
    content: jsonb('content').default([]).notNull(), // e.g., [{ type: 'text', value: 'chunk1' }, { type: 'file', url: '...' }]

    status: varchar('status', { length: 50 }).notNull().default('processing'), // 'processing', 'ready', 'failed'

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations for KnowledgeBase
export const knowledgeBasesRelations = relations(knowledgeBases, ({ one, many }) => ({
    creator: one(users, { // Each KB belongs to one creator
        fields: [knowledgeBases.creatorId],
        references: [users.id],
    }),
    callAgents: many(callAgents), // A KB can be used by many agents (optional link)
}));


// --- Contacts Table ---
// Represents contacts that agents might call or who might call agents
// Implied by callerName/callerNumber in Call data and potentially a future Contacts page
export const contacts = pgTable('contacts', {
    id: serial('id').primaryKey(),
    creatorId: varchar('creator_id', { length: 256 }).notNull().references(() => users.id, { onDelete: 'cascade' }), // Link to the user who owns the contact

    firstName: varchar('first_name', { length: 256 }),
    lastName: varchar('last_name', { length: 256 }),
    phoneNumber: varchar('phone_number', { length: 256 }).notNull(), // E.164 format +15551234567 - Unique per creator
    email: varchar('email', { length: 256 }),

    // Flexible field for other contact details
    otherDetails: jsonb('other_details').default({}).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    // Ensure a phone number is unique for a given user
    unqCreatorPhoneNumber: uniqueIndex('contact_creator_phone_unq').on(t.creatorId, t.phoneNumber),
}));

// Relations for Contact
export const contactsRelations = relations(contacts, ({ one, many }) => ({
    creator: one(users, { // Each contact belongs to one creator
        fields: [contacts.creatorId],
        references: [users.id],
    }),
    calls: many(calls), // A contact can be involved in many calls
}));


// --- Calls Table ---
// Records a specific call made or received by an agent
// This table powers the /[agentid]/calls page
export const calls = pgTable('calls', {
    id: serial('id').primaryKey(),
    agentId: integer('agent_id').notNull().references(() => callAgents.id, { onDelete: 'cascade' }), // Which agent handled the call - from CallsPage

    contactId: integer('contact_id').references(() => contacts.id, { onDelete: 'set null' }), // Link to a contact (optional) - from CallsPage mock data
    phoneNumber: varchar('phone_number', { length: 256 }).notNull(), // The phone number involved - from CallsPage mock data

    direction: varchar('direction', { length: 20 }).notNull(), // 'inbound', 'outbound' - from CallsPage mock data
    status: varchar('status', { length: 50 }).notNull(), // 'initiated', 'in-progress', 'completed', 'failed', 'voicemail', etc. - from CallsPage mock data

    startTime: timestamp('start_time').notNull(), // from CallsPage mock data
    endTime: timestamp('end_time'), // Null if call is ongoing or failed early - from CallsPage mock data
    duration: integer('duration'), // Duration in seconds, null if not completed - from CallsPage mock data

    transcript: text('transcript'), // Full conversation transcript (optional) - from TranscriptTab
    audioUrl: varchar('audio_url', { length: 256 }), // URL to recording (optional) - from TranscriptTab/DownloadDeleteTab

    // Store platform-specific call data if needed (e.g., Twilio SIDs)
    rawCallData: jsonb('raw_call_data'), // from CallsPage mock data

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(), // Often same as startTime or slightly before
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations for Call
export const callsRelations = relations(calls, ({ one, many }) => ({
    agent: one(callAgents, { // Each call belongs to one agent
        fields: [calls.agentId],
        references: [callAgents.id],
    }),
    contact: one(contacts, { // Each call can be linked to one contact (optional)
        fields: [calls.contactId],
        references: [contacts.id],
    }),
    callActionValues: many(callActionValues), // A call produces many extracted values
}));


// --- Call Action Values Table (Extracted data for actions during a call) ---
// Links a specific call to a specific configured action on the agent and stores the result
// This table stores the data shown in the ActionsDataTab
export const callActionValues = pgTable('call_action_values', {
    id: serial('id').primaryKey(),
    callId: integer('call_id').notNull().references(() => calls.id, { onDelete: 'cascade' }), // Link to the specific call
    agentActionId: integer('agent_action_id').notNull().references(() => agentActions.id, { onDelete: 'cascade' }), // Link to the configured action instance on the agent

    // The extracted value - can be string, boolean, number, object, array depending on action config
    // Derived from actionsData in CallsPage mock data
    value: jsonb('value'),
    rawValue: text('raw_value'), // Optionally store the raw text segment AI processed

    extractedAt: timestamp('extracted_at').defaultNow().notNull(), // When the value was extracted
    confidence: integer('confidence'), // Optional confidence score (e.g., 0-100)

}, (t) => ({
    // Ensure only one extracted value for a specific action instance within a specific call
    unqCallAgentActionValue: uniqueIndex('call_agent_action_value_unq').on(t.callId, t.agentActionId),
}));

// Relations for CallActionValue
export const callActionValuesRelations = relations(callActionValues, ({ one }) => ({
    call: one(calls, { // Each value belongs to one call
        fields: [callActionValues.callId],
        references: [calls.id],
    }),
    agentAction: one(agentActions, { // Each value corresponds to one configured action on the agent
        fields: [callActionValues.agentActionId],
        references: [agentActions.id],
    }),
}));

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