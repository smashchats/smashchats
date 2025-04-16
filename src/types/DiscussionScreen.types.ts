import { MessageStatus } from "@smashchats/library";
import { Media } from "@/src/db/models/Media";

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
    media: Media;
}

export type DisplayableMessage =
    | DisplayableSystemMessage
    | DisplayableChatMessage
    | DisplayableMediaMessage;
