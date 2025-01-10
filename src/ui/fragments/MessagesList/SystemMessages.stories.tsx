import { RenderMessageListItem } from "./MessagesList";

const meta = {
    title: "Components/Messages/System Messages",
    component: RenderMessageListItem,
    tags: ["autodocs"],
    argTypes: {},
};

export default meta;

const render = (args: any) => (
    <RenderMessageListItem message={{ ...args.message, ...args }} />
);

export const DateDivider = {
    args: {
        message: {
            type: "system-date",
        },
    },
    argTypes: {
        date: {
            control: "date",
        },
    },
    render,
};

export const UnreadMessages = {
    args: {
        message: {
            type: "system-unread",
        },
        content: 73,
    },
    argTypes: {
        content: {
            control: "number",
        },
    },
    render,
};
