import { DIDString, EncapsulatedIMProtoMessage, MessageStatus } from "@smashchats/library";
import { MediaMetadata } from "@/src/utils/MediaStorage";

export * from "./DiscussionScreen.types";
export * from "./ChatListScreen.types";
export * from "./Utils.types";
export * from "./Camera.types";

export type PartialWithId<T extends { id: string }> = Partial<T> &
    Pick<T, "id">;

export interface EnrichedSmashMessage extends EncapsulatedIMProtoMessage {
    fromDid: DIDString;
    toDiscussionId: DIDString;
}

export interface Message {
    sha256: string;
    timestamp: Date;
    status: MessageStatus;
    type: string;
    data: string;
    after_sha256: string | null;
    reply_to_sha256: string | null;
    from_did_id: string;
    discussion_id: string;
    created_at: Date;
    date_delivered: Date | null;
    date_read: Date | null;
    media?: MediaMetadata | null;
}
