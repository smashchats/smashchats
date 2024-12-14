import {
    UserGeneratedEventType,
    UserMessageEvent,
} from "@/src/events/user_generated.js";
import { EnrichedSmashMessage } from "@/src/models/Messages";
import { SmashDID } from "@smashchats/library";

const userMessageToAbstract = (msg: UserMessageEvent) => {
    switch (msg.data.type) {
        case "Text":
            return msg.data.message;
        case "Media":
            return "Media";
        case "Voice":
            return "Voice message";
        case "Reaction":
            return "Reacted to a message";
        case "Reply":
            return `Replied: ${msg.data.message}`;
        default:
            return "Unsupported message";
    }
};

export const INITIAL_USER_DATA_STATE: UserDisplayData = Object.freeze({
    lastUpdatedTimestamp: {
        ProfilePreview: new Date(0),
        UserMessage: new Date(0),
    },
    displayName: "User",
    excerpt: "",
    unreadMessages: false,
    unreadMessagesAmount: 0,
    messageTimestamp: new Date(0),
    uid: "",
    trusted: false,
    smashed: false,
});

export type ChatListsState = Record<string, UserDisplayData>;

export const INITIAL_STATE: ChatListsState = Object.freeze({});

export interface UserDisplayData {
    displayName: string;
    lastUpdatedTimestamp: Record<UserGeneratedEventType, Date>;
    avatar?: string;
    excerpt: string;
    messageTimestamp: Date;
    unreadMessages: boolean;
    unreadMessagesAmount: number;
    uid: string;
    trusted: boolean;
    smashed: boolean;
}

export const new_parser = (
    message: EnrichedSmashMessage,
    selfDid: SmashDID
): { [key: string]: any } => {
    switch (message.type) {
        case "profile":
            return {
                content:
                    selfDid.id === message.fromDid.id
                        ? "You sent them your profile"
                        : "They sent you their profile",
                type: "metadata",
            };
        case "join":
        case "discover":
        case "text":
            return {
                content: message.data,
                type: "text",
            };
        case "profiles":
            return {
                content:
                    selfDid.id === message.fromDid.id
                        ? "You sent them some profiles"
                        : "They sent you some profiles",
                type: "metadata",
            };
        case "action": {
            const action = (message.data as { action: string }).action;
            let content = "";
            switch (action) {
                case "smash":
                    content = "(You smashed them)";
                    break;
                case "pass":
                    content = "(You passed on them)";
                    break;
                case "block":
                    content = "(You blocked them)";
                    break;
            }
            return {
                content: selfDid.id === message.fromDid.id ? content : "",
                type: "action",
            };
        }
        default:
            return {
                content: "Unsupported message type",
                type: "error",
            };
    }
};
