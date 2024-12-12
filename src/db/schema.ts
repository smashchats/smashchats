import { relations, sql, eq, desc } from "drizzle-orm";
import {
    integer,
    sqliteTable,
    sqliteView,
    text,
} from "drizzle-orm/sqlite-core";
import { Contact } from "@/src/models/Contacts";
import { Message } from "@/src/models/Messages";
import { TrustRelation } from "@/src/models/TrustRelation";

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
    did_ik: text("did_ik", { mode: "text" }).notNull(),
    did_ek: text("did_ek", { mode: "text" }).notNull(),
    did_signature: text("did_signature", { mode: "text" }).notNull(),
    did_endpoints: text("did_endpoints", { mode: "json" }).notNull(),
    is_self: boolean("is_self"),
    notes: text(),
    meta_title: text(),
    meta_description: text(),
    meta_picture: text(),
    scores: text("scores", { mode: "json" }),
    smashed: boolean("smashed"),
    blocked: boolean("blocked"),
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

export const chatListView = sqliteView("chat_list_view").as((qb) =>
    qb
        .select({
            did_id: contacts.did_id,
            meta_title: contacts.meta_title,
            meta_picture: contacts.meta_picture,
            smashed: contacts.smashed,
            most_recent_message: messages.data,
            most_recent_message_type: messages.type,
            trusted_name: trustRelations.name,
            created_at: contacts.created_at,
            most_recent_message_date:
                sql<number>`MAX(${messages.created_at})`.as(
                    "most_recent_message_date"
                ),
            unread_count:
                sql<number>`COUNT(${messages.sha256}) - COUNT(${messages.date_read})`.as(
                    "unread_count"
                ),
        })
        .from(contacts)
        .leftJoin(messages, eq(contacts.did_id, messages.discussion_id))
        .leftJoin(trustRelations, eq(contacts.did_id, trustRelations.did_id))
        .groupBy(contacts.did_id)
        .orderBy(desc(messages.created_at))
);

export interface ChatListView {
    did_id: Contact["did_id"];
    meta_title: Contact["meta_title"];
    meta_picture: Contact["meta_picture"];
    smashed: Contact["smashed"];
    created_at: Contact["created_at"];
    most_recent_message: Message["data"];
    most_recent_message_type: Message["type"];
    trusted_name?: TrustRelation["name"];
    most_recent_message_date: number;
    unread_count: number;
}
