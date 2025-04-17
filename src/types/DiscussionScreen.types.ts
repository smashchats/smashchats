import { MessageStatus } from "@smashchats/library";
import { MediaMetadata } from "@/src/utils/MediaStorage";

export interface BaseDisplayableMessage {
    content: string | number;
    sha256: string;
    from: string;
    fromMe: boolean;
    type: string;
    date: Date;
}

export interface DisplayableSystemMessage extends BaseDisplayableMessage {
    type: `system-${string}`;
}

export interface DisplayableChatMessage extends BaseDisplayableMessage {
    status: MessageStatus;
}

export interface DisplayableMediaMessage extends BaseDisplayableMessage {
    media: MediaMetadata;
}

export type DisplayableMessage =
    | DisplayableSystemMessage
    | DisplayableChatMessage
    | DisplayableMediaMessage;
