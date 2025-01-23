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
    status?: "read" | "delivered" | "pending";
}

export type DisplayableMessage =
    | DisplayableSystemMessage
    | DisplayableChatMessage;
