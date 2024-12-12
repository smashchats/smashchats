import { EventBase } from "@/src/events/types.js";

export type UserGeneratedEventType = "ProfilePreview" | "UserMessage";

interface UserGeneratedEventBase extends EventBase {
    type: UserGeneratedEventType;
    to: string;
    id: string;
}

////

type ProfilePreviewData = {
    displayName: string;
    imageBase64?: string;
};

export interface ProfilePreviewEvent extends UserGeneratedEventBase {
    type: "ProfilePreview";
    data: ProfilePreviewData;
}

////////////
type UserMessageTextData = {
    type: "Text";
    message: string;
};
type UserMessageMediaData = {
    type: "Media";
    thumbnailBase64: string;
    cdnHash: string;
};
type UserMessageVoiceData = {
    type: "Voice";
};
type UserMessageReactionData = {
    type: "Reaction";
};
type UserMessageReplyData = {
    type: "Reply";
    message: string;
    originalMessageId: string;
};

type UserMessageData =
    | UserMessageTextData
    | UserMessageMediaData
    | UserMessageVoiceData
    | UserMessageReactionData
    | UserMessageReplyData;

export interface UserMessageEvent extends EventBase, UserGeneratedEventBase {
    type: "UserMessage";
    data: UserMessageData;
}

////

export type UserGeneratedEvent = ProfilePreviewEvent | UserMessageEvent;
