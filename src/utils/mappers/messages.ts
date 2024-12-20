import { EnrichedSmashMessage, MessageInsert } from "@/src/db/models/Messages";
import { DIDString, EncapsulatedIMProtoMessage, IM_CHAT_TEXT } from "@smashchats/library";

export const mapReceivedMessageToEnrichedMessage = (
    message: EncapsulatedIMProtoMessage,
    senderDid: DIDString,
): EnrichedSmashMessage => {
    let data;
    if (typeof message.data === "string") {
        data = message.data;
    } else {
        data = JSON.stringify(message.data);
    }
    const m: EnrichedSmashMessage = {
        ...message,
        fromDid: senderDid,
        toDiscussionId: senderDid,
        data,
    };
    return m;
};

export const ESMToMessageInsertMapper = (
    esm: EnrichedSmashMessage
): MessageInsert => {
    if (esm.type !== IM_CHAT_TEXT) {
        throw new Error("Message type is not IM_CHAT_TEXT");
    }

    return {
        sha256: esm.sha256,
        from_did_id: esm.fromDid,
        discussion_id: esm.toDiscussionId,
        timestamp: new Date(esm.timestamp),
        type: esm.type,
        data: esm.data as string,
        after_sha256: esm.after ?? null,
    };
};
