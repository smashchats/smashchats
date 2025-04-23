import { desc, eq, isNull, sql } from "drizzle-orm";

import { drizzle_db } from "@/src/db/database";
import { contacts, messages, trustRelations } from "@/src/db/schema.js";

export const chatListView = drizzle_db
    .select({
        did_id: contacts.did_id,
        meta_title: contacts.meta_title,
        meta_avatar: contacts.meta_avatar,
        meta_description: contacts.meta_description,
        notes: contacts.notes,
        smashed: contacts.smashed,
        active: contacts.active,
        most_recent_message: messages.data,
        most_recent_message_type: messages.type,
        trusted_name: trustRelations.name,
        created_at: contacts.created_at,
        most_recent_message_date: sql<number>`MAX(${messages.created_at})`.as(
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
    .where(isNull(contacts.blocked_at))
    .groupBy(contacts.did_id)
    .orderBy(desc(messages.created_at));
