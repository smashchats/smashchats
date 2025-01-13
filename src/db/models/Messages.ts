import {
    InferSelectModel,
    InferInsertModel,
    eq,
    isNull,
    and,
} from "drizzle-orm";

import { IM_CHAT_TEXT, sha256 } from "@smashchats/library";

import { messages } from "@/src/db/schema.js";
import { drizzle_db } from "@/src/db/database";
import { ESMToMessageInsertMapper } from "@/src/utils/mappers/messages";
import { EnrichedSmashMessage } from "@/src/types/";

export type Message = InferSelectModel<typeof messages>;
export type MessageInsert = InferInsertModel<typeof messages>;

export const saveMessageToDb = async (
    message: EnrichedSmashMessage,
    extraFields?: Partial<MessageInsert>
) => {
    if (message.type !== IM_CHAT_TEXT) {
        return;
    }
    const messageInsert = ESMToMessageInsertMapper(message);

    const [messageId] = await drizzle_db
        .insert(messages)
        .values({ ...messageInsert, ...extraFields })
        .returning({ id: messages.sha256 });
    return messageId;
};

export const markAllMessagesInDiscussionAsRead = async (
    discussionId: string
): Promise<sha256[]> => {
    const unreadMessages = await drizzle_db
        .select({ id: messages.sha256 })
        .from(messages)
        .where(and(eq(messages.discussion_id, discussionId), isNull(messages.date_read)));
    await drizzle_db
        .update(messages)
        .set({ date_read: new Date() })
        .where(
            and(
                eq(messages.discussion_id, discussionId),
                isNull(messages.date_read)
            )
        );
    return unreadMessages.map((m) => m.id as sha256);
};
