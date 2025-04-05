import {
    DIDString,
    EncapsulatedIMProtoMessage,
    IM_CHAT_TEXT,
    IM_MEDIA_EMBEDDED,
    reverseDNS,
} from "@smashchats/library";

import { MessageInsert } from "@/src/db/models/Messages";
import { EnrichedSmashMessage } from "@/src/types/";

export const mapReceivedMessageToEnrichedMessage = (
    message: EncapsulatedIMProtoMessage,
    senderDid: DIDString
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

// SUPPORT FOR NEW MESSAGE TYPES SHOULD BE ADDED HERE
export const ESMToMessageInsertMapper = (
    esm: EnrichedSmashMessage
): MessageInsert => {
    const supportedTypes: reverseDNS[] = [IM_CHAT_TEXT, IM_MEDIA_EMBEDDED];
    if (!supportedTypes.includes(esm.type)) {
        throw new Error(`Message type (${esm.type}) is not supported`);
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
