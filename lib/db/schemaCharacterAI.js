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
    uniqueIndex // Import uniqueIndex for constraints
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