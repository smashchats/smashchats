import { Badge } from "./Badge";
import { BadgeText } from "./BadgeText";

const meta = {
    title: "Design System/Badge",
    component: Badge,
    subcomponents: { BadgeText },
    argTypes: {
        bg: {
            control: "text",
        },
        bgColor: {
            control: "text",
        },
        size: {
            control: "text",
        },
        type: {
            control: "select",
            options: ["selected", "unselected", "disabled"],
        },
        h: {
            control: "text",
        },
        width: {
            control: "text",
        },
        flex: {
            control: "number",
        },
    },
};

export default meta;

export const Default = {
    args: {
        type: "unselected",
    },
    render: (args: any) => (
        <Badge {...args}>
            <BadgeText>Badge Text</BadgeText>
        </Badge>
    ),
};

export const WithCustomBackground = {
    args: {
        bgColor: "#6366f1",
    },
    render: (args: any) => (
        <Badge {...args}>
            <BadgeText>Custom Background</BadgeText>
        </Badge>
    ),
};

export const WithCustomSize = {
    args: {
        h: 32,
        width: 120,
    },
    render: (args: any) => (
        <Badge {...args}>
            <BadgeText>Custom Size</BadgeText>
        </Badge>
    ),
};

export const Selected = {
    args: {
        type: "selected",
    },
    render: (args: any) => (
        <Badge {...args}>
            <BadgeText>Selected</BadgeText>
        </Badge>
    ),
};
