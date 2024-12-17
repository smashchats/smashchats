import { ChatListFilters } from "@/src/components/fragments/ChatList/ChatListFilters.jsx";
import {
    filterChatsBasedOnFilters,
    INITIAL_CHAT_LIST_STATE,
} from "@/src/context/ChatListContext.js";
import {
    GlobalParams,
    GlobalProvider,
    INITIAL_GLOBAL_STATE,
} from "@/src/context/GlobalContext.jsx";
import { ChatListView } from "@/src/db/schema";
import { fireEvent, render } from "@testing-library/react-native";

const DEFAULT_VALUES: Partial<ChatListView> = {
    most_recent_message: "string",
    most_recent_message_type: "text",
    most_recent_message_date: new Date().getTime(),
    did_id: "string",
    smashed: false,
    unread_count: 0,
};

describe("filter types", () => {
    test("unread", () => {
        const chat: ChatListView = {
            ...DEFAULT_VALUES,
            unread_count: 1,
        } as ChatListView;

        expect(filterChatsBasedOnFilters(chat, ["unread"])).toBeTruthy();
    });
    test("smashed", () => {
        const chat: ChatListView = {
            ...DEFAULT_VALUES,
            smashed: true,
        } as ChatListView;

        expect(filterChatsBasedOnFilters(chat, ["smashed"])).toBeTruthy();
        expect(filterChatsBasedOnFilters(chat, ["trusted"])).toBeFalsy();
    });
    test("unread", () => {
        const chat: ChatListView = {
            ...DEFAULT_VALUES,
            trusted_name: "trusted",
        } as ChatListView;

        expect(filterChatsBasedOnFilters(chat, ["trusted"])).toBeTruthy();
        expect(filterChatsBasedOnFilters(chat, ["smashed"])).toBeFalsy();
    });
    test("content in name", () => {
        const chat: ChatListView = {
            ...DEFAULT_VALUES,
            meta_title: "my fav cat",
        } as ChatListView;

        expect(filterChatsBasedOnFilters(chat, ["cat"])).toBeTruthy();
    });
});

describe("filter amounts", () => {
    test("one", () => {
        const chat: ChatListView = {
            ...DEFAULT_VALUES,
            unread_count: 1,
        } as ChatListView;

        expect(filterChatsBasedOnFilters(chat, ["unread"])).toBeTruthy();
    });

    test("two", () => {
        const chat: ChatListView = {
            ...DEFAULT_VALUES,
            unread_count: 2,
        } as ChatListView;

        expect(
            filterChatsBasedOnFilters(chat, ["unread", "smashed"])
        ).toBeFalsy();
        expect(
            filterChatsBasedOnFilters({ ...chat, smashed: true }, [
                "unread",
                "smashed",
            ])
        ).toBeTruthy();
    });
});

describe("empty name", () => {
    const chat: ChatListView = {
        ...DEFAULT_VALUES,
        meta_title: null,
    } as ChatListView;

    expect(filterChatsBasedOnFilters(chat, ["cat"])).toBeFalsy();
});

describe("ui", () => {
    const INITIAL_STATE = {
        ...INITIAL_GLOBAL_STATE,
        chatList: {
            ...INITIAL_CHAT_LIST_STATE,
        },
    };
    let initialState: GlobalParams;

    beforeEach(() => {
        initialState = { ...INITIAL_STATE };
    });

    it("renders correctly", () => {
        initialState.chatList.selectedFilters = ["unread", "trusted"];

        const tree = render(
            <GlobalProvider initialState={initialState}>
                <ChatListFilters />
            </GlobalProvider>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    it("selects a filter when you click on it", () => {
        const { toJSON, getByText } = render(
            <GlobalProvider initialState={initialState}>
                <ChatListFilters />
            </GlobalProvider>
        );

        const filter = getByText("unread");

        expect(toJSON()).toMatchSnapshot();

        fireEvent.press(filter);

        expect(toJSON()).toMatchSnapshot();
    });
});
