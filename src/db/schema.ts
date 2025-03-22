import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text, } from "drizzle-orm/sqlite-core";

const timestamp = (fieldName: string) =>
    integer(fieldName, { mode: "timestamp" });

const defaultTimestamp = (fieldName: string) =>
    timestamp(fieldName)
        .default(sql`(unixepoch())`)
        .notNull();

const boolean = (fieldName: string, defaultValue: boolean = false) =>
    integer(fieldName, { mode: "boolean" }).default(defaultValue);

export const contacts = sqliteTable("contacts", {
    did_id: text("did_id", { mode: "text" }).primaryKey(),
    did_ik: text("did_ik", { mode: "text" }),
    did_ek: text("did_ek", { mode: "text" }),
    did_signature: text("did_signature", { mode: "text" }),
    did_endpoints: text("did_endpoints", { mode: "json" }),
    notes: text(),
    meta_title: text(),
    meta_description: text(),
    meta_avatar: text(),
    scores: text("scores", { mode: "json" }),
    smashed: boolean("smashed"),
    blocked: boolean("blocked"),
    active: boolean("active"),
    created_at: defaultTimestamp("created_at"),
    updated_at: defaultTimestamp("updated_at"),
});

export const trustRelations = sqliteTable("trust_relations", {
    did_id: text("did_id", { mode: "text" }).primaryKey(),
    created_at: defaultTimestamp("created_at"),
    name: text("name", { mode: "text" }).notNull(),
});

export const messages = sqliteTable("messages", {
    sha256: text().primaryKey(),
    timestamp: defaultTimestamp("timestamp"),
    // sending --> delivered (to SME) --> received (by peer) --> read (by peer)
    status: text("status", { mode: "text" }).notNull().default("sending"),
    type: text("type", { mode: "text" }).notNull(),
    data: text("data", { mode: "text" }).notNull(),
    after_sha256: text(),
    reply_to_sha256: text(),
    from_did_id: text()
        .notNull()
        .references(() => contacts.did_id),
    discussion_id: text()
        .notNull()
        .references(() => contacts.did_id),
    created_at: defaultTimestamp("created_at"),
    date_delivered: timestamp("date_delivered"),
    // if message if from peer, we store the date the user (self) read the message ; if message is from self, we store the date the peer read the message
    date_read: timestamp("date_read"),
});

export const media = sqliteTable("media", {
    sha256: text("sha256").primaryKey(),
    file_path: text("file_path").notNull(),
    mime_type: text("mime_type").notNull(),
    media_type: text("media_type", { mode: "text" }).notNull(), // "image", "video", "audio"
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"), // for video/audio in seconds
    size: integer("size").notNull(),
    thumbnail_path: text("thumbnail_path"), // for video thumbnails
    created_at: defaultTimestamp("created_at"),
    updated_at: defaultTimestamp("updated_at"),
});

export const contactsRelations = relations(contacts, ({ many }) => ({
    messages: many(messages),
}));

export const mediaRelations = relations(media, ({ one }) => ({
    message: one(messages, {
        fields: [media.sha256],
        references: [messages.sha256],
    }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    from: one(contacts, {
        fields: [messages.from_did_id],
        references: [contacts.did_id],
    }),
    to: one(contacts, {
        fields: [messages.discussion_id],
        references: [contacts.did_id],
    }),
    media: one(media, {
        fields: [messages.sha256],
        references: [media.sha256],
    }),
}));

export const trustRelationsRelations = relations(trustRelations, ({ one }) => ({
    contact: one(contacts, {
        fields: [trustRelations.did_id],
        references: [contacts.did_id],
    }),
}));
