import { Action, GlobalActionBase } from "@/src/context/GlobalContext.jsx";
import { ChatListView } from "@/src/types/";

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
                    (chat.trusted_name ?? "").includes(filter) ||
                    (chat.meta_description ?? "").includes(filter) ||
                    (chat.notes ?? "").includes(filter)
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

interface DraftAction extends ChatListActionBase {
    type: "CHAT_LIST_DRAFT_ACTION";
    draft: string;
    did_id: string;
}

export type ChatListAction = ToggleFilterAction | DraftAction;

//
// CONTEXT
//
export type ChatListParams = {
    selectedFilters: string[];
    drafts: {
        [key: string]: string;
    };
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
    if (
        !["CHAT_LIST_TOGGLE_FILTER_ACTION", "CHAT_LIST_DRAFT_ACTION"].includes(
            action.type
        )
    ) {
        return state;
    }

    return {
        ...state,
        selectedFilters: selectedFiltersReducer(state.selectedFilters, action),
        drafts: draftReducer(state.drafts, action),
    };
};

export const selectedFiltersReducer = (
    state: string[],
    action: ToggleFilterAction | Action
): string[] => {
    if (action.type !== "CHAT_LIST_TOGGLE_FILTER_ACTION") {
        return state;
    }

    const isUserAddingFilter = !state.includes(action.filter);
    const selectedFilters = isUserAddingFilter
        ? [...state, action.filter]
        : [...state.filter((f) => f != action.filter)];

    return selectedFilters;
};

export const draftReducer = (
    state: { [key: string]: string },
    action: DraftAction | Action
): { [key: string]: string } => {
    if (action.type !== "CHAT_LIST_DRAFT_ACTION") {
        return state;
    }

    return { ...state, [action.did_id]: action.draft };
};
