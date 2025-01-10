import { RenderMessageListItem } from "./MessagesList";
import { IM_CHAT_TEXT } from "@smashchats/library";

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
