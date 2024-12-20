import {
    InferSelectModel,
    InferInsertModel,
    eq,
    isNull,
    and,
} from "drizzle-orm";

import { EncapsulatedIMProtoMessage, IM_PROFILE, IM_CHAT_TEXT, DIDString, Logger, IMProfile } from "@smashchats/library";

import { messages } from "@/src/db/schema.js";
import { drizzle_db } from "@/src/db/database";
import { updateContact } from "@/src/db/models/Contacts.js";
import { ESMToMessageInsertMapper } from "@/src/utils/mappers/messages";

export interface EnrichedSmashMessage extends EncapsulatedIMProtoMessage {
    fromDid: DIDString;
    toDiscussionId: DIDString;
}

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

export const parseDataInMessage = async (message: EncapsulatedIMProtoMessage, logger: Logger) => {
    if (message.type === IM_PROFILE) {
        logger.debug("parsing profile message", JSON.stringify(message.data));
        await updateContact(message.data as IMProfile);
    }
};

export const markAllMessagesInDiscussionAsRead = async (
    discussionId: string
) => {
    await drizzle_db
        .update(messages)
        .set({ date_read: new Date() })
        .where(
            and(
                eq(messages.discussion_id, discussionId),
                isNull(messages.date_read)
            )
        );
};
