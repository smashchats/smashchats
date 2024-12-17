import { Action, GlobalActionBase } from "@/src/context/GlobalContext.jsx";
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
