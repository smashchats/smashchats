import {
    filterChatsBasedOnFilters,
    getShownChats,
} from "@/src/context/ChatListContext";
import { ChatListView } from "@/src/types/ChatListScreen.types";

const getChat = (id: number): ChatListView => ({
    notes: `note ${id}`,
    meta_title: `title ${id}`,
    meta_description: `description ${id}`,
    trusted_name: `trusted name ${id}`,
    did_id: `did ${id}`,
    active: true,
    smashed: false,
    created_at: new Date(),
    unread_count: 0,
    most_recent_message: `message ${id}`,
    most_recent_message_type: `message type ${id}`,
    most_recent_message_date: 1,
});

describe("ChatListContext", () => {
    describe("filterChatsBasedOnFilters", () => {
        it("should filter chats based on filters", () => {
            const chats: ChatListView[] = [getChat(1), getChat(2)];
            const filters = ["note 1"];

            expect(filterChatsBasedOnFilters(chats[0], filters)).toBe(true);
            expect(filterChatsBasedOnFilters(chats[1], filters)).toBe(false);
        });
    });

    describe("getShownChats", () => {
        it("should get shown chats", () => {
            const chats: ChatListView[] = [getChat(1), getChat(2)];
            const filters = ["note 1"];

            expect(getShownChats(chats, filters)).toHaveLength(1);
        });
    });
});
