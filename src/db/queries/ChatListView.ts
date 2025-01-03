import { desc, eq, sql } from "drizzle-orm";

import { drizzle_db } from "@/src/db/database";
import { contacts, messages, trustRelations } from "@/src/db/schema.js";

import { Contact } from "@/src/db/models/Contacts";
import { Message } from "@/src/db/models/Messages";
import { TrustRelation } from "@/src/db/models/TrustRelation";

export const chatListView = drizzle_db
    .select({
        did_id: contacts.did_id,
        meta_title: contacts.meta_title,
        meta_avatar: contacts.meta_avatar,
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
    .orderBy(desc(messages.created_at));

export interface ChatListView {
    did_id: Contact["did_id"];
    meta_title: Contact["meta_title"];
    meta_avatar: Contact["meta_avatar"];
    smashed: Contact["smashed"];
    created_at: Contact["created_at"];
    most_recent_message: Message["data"];
    most_recent_message_type: Message["type"];
    trusted_name?: TrustRelation["name"];
    most_recent_message_date: number;
    unread_count: number;
}
