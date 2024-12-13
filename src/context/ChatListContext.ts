import { EncapsulatedSmashMessage, SmashDID } from "smash-node-lib";

import { UserDisplayData } from "@/src/events/UserDisplayDataReducer.js";
import { Action, GlobalActionBase } from "@/src/context/GlobalContext.jsx";
import { Message } from "@/src/app/profile/[user]/(tabs)/messages";
import { ChatListView } from "@/src/db/schema";

export const filterChatsBasedOnFilters = (
    chat: ChatListView,
    filters: string[]
): boolean => {
    return filters.every((filter) => {
        switch (filter) {
            case "trusted":
                return chat.trusted_name !== undefined;
            case "smashed":
                return chat.smashed;
            case "unread":
                return chat.unread_count > 0;
            default:
                return (
                    (chat.meta_title ?? "").includes(filter) ||
                    (chat.trusted_name ?? "").includes(filter)
                );
        }
    });
};

export const getShownChats = (chats: ChatListView[], filters: string[]) => {
    return [...chats.filter((c) => filterChatsBasedOnFilters(c, filters))].sort(
        CHAT_SORTER
    );
};

interface ChatListActionBase extends GlobalActionBase {
    type: `CHAT_LIST_${string}_ACTION`;
}

//
// ACTIONS
//
interface ToggleFilterAction extends ChatListActionBase {
    type: "CHAT_LIST_TOGGLE_FILTER_ACTION";
    filter: string;
}

export type ChatListAction = ToggleFilterAction;

//
// CONTEXT
//
export type ChatListParams = {
    selectedFilters: string[];
};

const CHAT_SORTER = (a: ChatListView, b: ChatListView) =>
    a.most_recent_message_date < b.most_recent_message_date ? 1 : -1;

export const INITIAL_CHAT_LIST_STATE: ChatListParams = {
    selectedFilters: [],
};

export const chatListReducer = (
    state: ChatListParams,
    action: ChatListAction | Action
): ChatListParams => {
    if (action.type !== "CHAT_LIST_TOGGLE_FILTER_ACTION") {
        return state;
    }

    const isUserAddingFilter = !state.selectedFilters.includes(action.filter);
    const selectedFilters = isUserAddingFilter
        ? [...state.selectedFilters, action.filter]
        : [...state.selectedFilters.filter((f) => f != action.filter)];

    return {
        ...state,
        selectedFilters,
    };
};

export const SmashMessageToMessage = (
    message: EncapsulatedSmashMessage,
    from: SmashDID
): Message => {
    let content: string = "";
    let type: string = "";

    switch (message.type) {
        case "join": {
            content = `Joined the neighbourhood`;
            type = "metadata";
            break;
        }
        case "discover": {
            content = `Discovered ${
                (message.data as { displayName: string }).displayName
            }`;
            type = "metadata";
            break;
        }
        case "text": {
            content = message.data as string;
            type = "text";
            break;
        }
        case "profile": {
            content = `Sent you their? profile`; // TODO adapt to situation
            type = "metadata";
            break;
        }
        case "profiles": {
            content = `Sent you a list of profiles`;
            type = "metadata";
            break;
        }
        case "action": {
            content = `Sent you an action`;
            type = "metadata";
            break;
        }
    }

    return {
        date: new Date(message.timestamp),
        content,
        sha256: message.sha256,
        from: from.id,
        type,
    };
};

export const MessageToUserDisplayData = (
    originalData: UserDisplayData,
    message: Message
): UserDisplayData => {
    return {
        ...originalData,
        lastUpdatedTimestamp: {
            ...originalData.lastUpdatedTimestamp,
            [message.type]: message.date,
        },
        avatar: originalData.avatar,
        excerpt: message.content,
        messageTimestamp: message.date,
        unreadMessages: true,
        unreadMessagesAmount: originalData.unreadMessagesAmount + 1,
    };
};
