import { MessageStatus } from "@smashchats/library";

export interface DisplayableSystemMessage {
    content: string | number;
    sha256: string;
    from: string;
    fromMe: boolean;
    type: `system-${string}`;
    date: Date;
}

export interface DisplayableChatMessage {
    content: string;
    sha256: string;
    from: string;
    fromMe: boolean;
    type: string;
    date: Date;
    status: MessageStatus;
}

export type DisplayableMessage =
    | DisplayableSystemMessage
    | DisplayableChatMessage;
