import { IM_CHAT_TEXT, MessageStatus as MS } from "@smashchats/library";

import { Box } from "@/src/ui/design-system/layout";

import { RenderMessageListItem } from "./MessagesList";

const meta = {
    title: "Components/Messages/User Messages",
    component: RenderMessageListItem,
    tags: ["autodocs"],
    argTypes: {
        fromMe: {
            control: "boolean",
        },
        content: {
            control: "text",
        },
    },
};

export default meta;

const render = (args: any) => (
    <RenderMessageListItem message={{ ...args.message, ...args }} />
);

export const TextMessage = {
    args: {
        message: {
            type: IM_CHAT_TEXT,
        },
        fromMe: false,
        content: "Hello world!",
    },
    render,
};

export const MetadataMessage = {
    args: {
        message: {
            content: "User is typing...",
            sha256: "meta123",
            from: "system",
            fromMe: false,
            type: "metadata",
            date: new Date("2024-01-01T12:00:00Z"),
        },
    },
    render,
};

export const MessageStatus = {
    render: () => {
        const contents = [
            "Hey you",
            "I like you too",
            "And do you mind if I strut for you?",
            "Baby, feel free to strut for me",
            "You got a strut everybody should see",
            "Watch that thing go side to side",
        ];
        const statuses = ["", "read", "delivered", "sending", "failed", ""];
        return (
            <Box>
                {statuses.map((status, idx) => (
                    <RenderMessageListItem
                        message={{
                            status: status as MS,
                            content: contents[idx % contents.length],
                            type: IM_CHAT_TEXT,
                            from: "system",
                            fromMe: idx !== 0,
                            sha256: "meta123",
                            date: new Date("2024-01-01T11:34:00Z"),
                        }}
                    />
                ))}
            </Box>
        );
    },
};
