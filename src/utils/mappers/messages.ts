import { MessageInsert } from "@/src/db/models/Messages";
import { EnrichedSmashMessage } from "@/src/types/";
import {
    SMASH_MEDIA_VIDEO,
    SMASH_MEDIA_PHOTO,
} from "@/src/types/smash/lexicons";
import {
    DIDString,
    EncapsulatedIMProtoMessage,
    IM_CHAT_TEXT,
} from "@smashchats/library";

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
    if (
        ![IM_CHAT_TEXT, SMASH_MEDIA_PHOTO, SMASH_MEDIA_VIDEO].includes(esm.type)
    ) {
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
