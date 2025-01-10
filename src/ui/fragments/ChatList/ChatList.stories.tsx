import { ChatListView } from "@/src/types/ChatListScreen.types";
import { ChatList } from "./ChatList";
import { IM_CHAT_TEXT } from "@smashchats/library";

const meta = {
    title: "Fragments/ChatList",
    component: ChatList,

    tags: ["autodocs"],
};

export default meta;

export const Default = {
    render: (args: any) => <ChatList {...args} />,
    args: {
        chats: [
            {
                did_id: "1",
                meta_title: "John Doe",
                meta_avatar: "https://github.com/smashchats.png",
                active: true,
                trusted_name: "Smashchats Admin",
                smashed: false,
                created_at: new Date(),
                most_recent_message: "Hey, how are you?",
                most_recent_message_type: IM_CHAT_TEXT,
                most_recent_message_date: new Date().getTime(),
                unread_count: 2,
            },
            {
                did_id: "2",
                meta_title: "Jane Smith",
                meta_avatar: "https://via.placeholder.com/150",
                active: true,
                smashed: false,
                created_at: new Date(),
                most_recent_message: "See you tomorrow!",
                most_recent_message_type: IM_CHAT_TEXT,
                most_recent_message_date: new Date().getTime(),
                unread_count: 0,
            },
        ] satisfies ChatListView[],
    },
};

export const Empty = {
    render: (args: any) => <ChatList {...args} />,
    args: {
        chats: [],
    },
};
