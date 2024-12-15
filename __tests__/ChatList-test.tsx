import { ChatListFilters } from "@/src/components/fragments/ChatList/ChatListFilters.jsx";
import {
    filterChatsBasedOnFilters,
    INITIAL_CHAT_LIST_STATE,
    SmashMessageToMessage,
} from "@/src/context/ChatListContext.js";
import {
    GlobalParams,
    GlobalProvider,
    INITIAL_GLOBAL_STATE,
} from "@/src/context/GlobalContext.jsx";
import { ChatListView } from "@/src/db/schema";
import { fireEvent, render } from "@testing-library/react-native";
import { EncapsulatedSmashMessage, SmashDID } from "@smashchats/library";

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

describe("SmashMessage converter", () => {
    test("converts a profile message", () => {
        const message: EncapsulatedSmashMessage = {
            type: "profile",
            timestamp: new Date("2024-01-01").toISOString(),
            sha256: "sha256",
            data: {
                displayName: "New username",
            },
            after: "after",
        };

        const result = SmashMessageToMessage(message, { id: "id" } as SmashDID);
        expect(result.type).toBe("metadata");
        expect(result.date).toStrictEqual(new Date(message.timestamp));
        expect(result.content).toBe("Sent you their? profile");
        expect(result.from).toBe("id");
    });

    test("converts a join message", () => {
        const message: EncapsulatedSmashMessage = {
            type: "join",
            timestamp: new Date("2024-01-01").toISOString(),
            sha256: "sha256",
            data: {
                displayName: "New user",
            },
            after: "after",
        };
        const result = SmashMessageToMessage(message, { id: "id" } as SmashDID);
        expect(result.type).toBe("metadata");
        expect(result.date).toStrictEqual(new Date(message.timestamp));
        expect(result.content).toBe("Joined the neighbourhood");
        expect(result.from).toBe("id");
    });

    test("converts a discover message", () => {
        const message: EncapsulatedSmashMessage = {
            type: "discover",
            timestamp: new Date("2024-01-01").toISOString(),
            sha256: "sha256",
            data: {
                displayName: "username1234",
            },
            after: "after",
        };
        const result = SmashMessageToMessage(message, { id: "id" } as SmashDID);
        expect(result.type).toBe("metadata");
        expect(result.date).toStrictEqual(new Date(message.timestamp));
        expect(result.content).toBe("Discovered username1234");
        expect(result.from).toBe("id");
    });

    test("converts a text message", () => {
        const message: EncapsulatedSmashMessage = {
            type: "text",
            timestamp: new Date("2024-01-01").toISOString(),
            sha256: "sha256",
            data: "Hello world",
            after: "after",
        };
        const result = SmashMessageToMessage(message, { id: "id" } as SmashDID);
        expect(result.type).toBe("text");
        expect(result.date).toStrictEqual(new Date(message.timestamp));
        expect(result.content).toBe("Hello world");
        expect(result.from).toBe("id");
    });

    test("converts a profiles message", () => {
        const message: EncapsulatedSmashMessage = {
            type: "profiles",
            timestamp: new Date("2024-01-01").toISOString(),
            sha256: "sha256",
            data: {
                profiles: [
                    { displayName: "User 1" },
                    { displayName: "User 2" },
                ],
            },
            after: "after",
        };
        const result = SmashMessageToMessage(message, { id: "id" } as SmashDID);
        expect(result.type).toBe("metadata");
        expect(result.date).toStrictEqual(new Date(message.timestamp));
        expect(result.content).toBe("Sent you a list of profiles");
        expect(result.from).toBe("id");
    });

    test("converts an action message", () => {
        const message: EncapsulatedSmashMessage = {
            type: "action",
            timestamp: new Date("2024-01-01").toISOString(),
            sha256: "sha256",
            data: {
                action: "someAction",
                payload: { key: "value" },
            },
            after: "after",
        };
        const result = SmashMessageToMessage(message, { id: "id" } as SmashDID);
        expect(result.type).toBe("metadata");
        expect(result.date).toStrictEqual(new Date(message.timestamp));
        expect(result.content).toBe("Sent you an action");
        expect(result.from).toBe("id");
    });
});
