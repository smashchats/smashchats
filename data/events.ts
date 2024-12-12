import {
    ProfilePreviewEvent,
    UserMessageEvent,
} from "@/src/events/user_generated.js";

export const PROFILE_PREVIEW = (uid: string): ProfilePreviewEvent => ({
    type: "ProfilePreview",
    timestamp: new Date("2000"),
    data: {
        displayName: `username ${uid}`,
    },
    id: "",
    generatedBy: `${uid}`,
    to: "me-uuid",
});

export const USER_TEXT = (uid: string): UserMessageEvent => ({
    type: "UserMessage",
    timestamp: new Date(),
    data: {
        message: "hello, it's me",
        type: "Text",
    },
    id: "",
    generatedBy: `${uid}`,
    to: "me-uuid",
});

export const USER_MEDIA = (uid: string): UserMessageEvent => ({
    type: "UserMessage",
    timestamp: new Date("2002"),
    generatedBy: `${uid}`,
    to: "me-uuid",
    id: "",
    data: {
        type: "Media",
        thumbnailBase64: "",
        cdnHash: "",
    },
});

export const USER_REACTION = (uid: string): UserMessageEvent => ({
    type: "UserMessage",
    timestamp: new Date("2033"),
    generatedBy: `${uid}`,
    to: "me-uuid",
    id: "",
    data: {
        type: "Reaction",
    },
});
export const USER_REPLY = (uid: string): UserMessageEvent => ({
    type: "UserMessage",
    timestamp: new Date("2004"),
    generatedBy: `${uid}`,
    to: "me-uuid",
    id: "",
    data: {
        message: "hello, it's also me",
        type: "Reply",
        originalMessageId: "",
    },
});
