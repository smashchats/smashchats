import { InferSelectModel, InferInsertModel, eq } from "drizzle-orm";

import { EncapsulatedSmashMessage, SmashDID } from "@smashchats/library";

import { messages } from "@/src/db/schema.js";
import { drizzle_db } from "@/src/db/database";
import {
    getContactFromDb,
    saveContactToDb,
    updateContact,
} from "@/src/models/Contacts.js";

export interface EnrichedSmashMessage extends EncapsulatedSmashMessage {
    fromDid: SmashDID;
    toDiscussionId: string;
}

export type Message = InferSelectModel<typeof messages>;
export type MessageInsert = InferInsertModel<typeof messages>;

export const ESMToMessageInsertMapper = (
    esm: EnrichedSmashMessage
): MessageInsert => {
    const data =
        esm.type === "text" ? (esm.data as string) : JSON.stringify(esm.data);
    return {
        sha256: esm.sha256,
        from_did_id: esm.fromDid.id,
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
    if (!["text"].includes(message.type)) {
        return;
    }
    const messageInsert = ESMToMessageInsertMapper(message);

    const contact = await getContactFromDb(message.fromDid.id);

    if (!contact) {
        console.debug("contact not found, saving");
        await saveContactToDb({
            did_id: message.fromDid.id,
            did_ik: message.fromDid.ik,
            did_ek: message.fromDid.ek,
            did_signature: message.fromDid.signature,
            did_endpoints: message.fromDid.endpoints ?? [],
        });
    }
    const [messageId] = await drizzle_db
        .insert(messages)
        .values({ ...messageInsert, ...extraFields })
        .returning({ id: messages.sha256 });
    return messageId;
};

export const parseDataInMessage = async (message: EnrichedSmashMessage) => {
    if (message.type === "profile") {
        await updateContact(JSON.parse(message.data as string));
    } else if (message.type === "profiles") {
        // not parsing profiles because this is done through nbh_profiles
    }
};

export const markMessageAsRead = async (messageId: string) => {
    await drizzle_db
        .update(messages)
        .set({ date_read: new Date() })
        .where(eq(messages.sha256, messageId));
};
