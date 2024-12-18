import {
    InferSelectModel,
    InferInsertModel,
    eq,
    isNull,
    and,
} from "drizzle-orm";

import { EncapsulatedIMProtoMessage, IM_PROFILE, IM_CHAT_TEXT, DIDString } from "@smashchats/library";

import { messages } from "@/src/db/schema.js";
import { drizzle_db } from "@/src/db/database";
import {
    getContactFromDb,
    saveContactToDb,
    updateContact,
} from "@/src/models/Contacts.js";

export interface EnrichedSmashMessage extends EncapsulatedIMProtoMessage {
    fromDid: DIDString;
    toDiscussionId: DIDString;
}

export type Message = InferSelectModel<typeof messages>;
export type MessageInsert = InferInsertModel<typeof messages>;

export const ESMToMessageInsertMapper = (
    esm: EnrichedSmashMessage
): MessageInsert => {
    const data =
        esm.type === IM_CHAT_TEXT ? (esm.data as string) : JSON.stringify(esm.data);
    return {
        sha256: esm.sha256,
        from_did_id: esm.fromDid,
        discussion_id: esm.toDiscussionId,
        timestamp: new Date(esm.timestamp),
        type: esm.type,
        data,
        after_sha256: esm.after ?? null,
    };
};

export const saveMessageToDb = async (
    message: EnrichedSmashMessage,
    extraFields?: Partial<MessageInsert>
) => {
    if (![IM_CHAT_TEXT].includes(message.type)) {
        return;
    }
    const messageInsert = ESMToMessageInsertMapper(message);

    const contact = await getContactFromDb(message.fromDid);

    if (!contact) {
        console.debug("contact not found, saving");
        await saveContactToDb({
            did_id: message.fromDid
        });
    }
    const [messageId] = await drizzle_db
        .insert(messages)
        .values({ ...messageInsert, ...extraFields })
        .returning({ id: messages.sha256 });
    return messageId;
};

export const parseDataInMessage = async (message: EncapsulatedIMProtoMessage) => {
    if (message.type === IM_PROFILE) {
        await updateContact(JSON.parse(message.data as string));
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
