import { IM_CHAT_TEXT } from "@smashchats/library";

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
        return (
            <Box>
                <RenderMessageListItem
                    message={{
                        type: IM_CHAT_TEXT,
                        content: "Hey you",
                        from: "system",
                        fromMe: false,
                        sha256: "meta123",
                        date: new Date("2024-01-01T11:34:00Z"),
                    }}
                />

                <RenderMessageListItem
                    message={{
                        type: IM_CHAT_TEXT,
                        content: "I like you too",
                        from: "system",
                        fromMe: true,
                        sha256: "meta123",
                        date: new Date("2024-01-01T16:14:00Z"),
                        status: "read",
                    }}
                />

                <RenderMessageListItem
                    message={{
                        type: IM_CHAT_TEXT,
                        content: "And do you mind if I strut for you?",
                        from: "system",
                        fromMe: true,
                        sha256: "meta123",
                        date: new Date("2024-01-01T17:14:00Z"),
                        status: "delivered",
                    }}
                />

                <RenderMessageListItem
                    message={{
                        type: IM_CHAT_TEXT,
                        content: "Baby, feel free to strut for me",
                        from: "system",
                        fromMe: true,
                        sha256: "meta123",
                        date: new Date("2024-01-01T18:14:00Z"),
                        status: "pending",
                    }}
                />

                <RenderMessageListItem
                    message={{
                        type: IM_CHAT_TEXT,
                        content: "You got a strut everybody should see",
                        from: "system",
                        fromMe: true,
                        sha256: "meta123",
                        date: new Date("2024-01-01T18:14:00Z"),
                        status: "" as "read",
                    }}
                />
            </Box>
        );
    },
};
