import { Text } from "./Text";

const meta = {
    title: "Design System/Text",
    component: Text,
    argTypes: {
        children: {
            control: "text",
        },
        color: {
            control: "text",
        }
    },
};

export default meta;

export const Default = {
    args: {
        children: "Default Text",
    },
};

export const CustomColor = {
    args: {
        children: "Custom Color Text",
        color: "#6366f1"
    },
};
