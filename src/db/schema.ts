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
    date_read: timestamp("date_read"),
});

export const contactsRelations = relations(contacts, ({ many }) => ({
    messages: many(messages),
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
}));

export const trustRelationsRelations = relations(trustRelations, ({ one }) => ({
    contact: one(contacts, {
        fields: [trustRelations.did_id],
        references: [contacts.did_id],
    }),
}));
