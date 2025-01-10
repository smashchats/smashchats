import { Box } from "../../design-system/layout";
import { Avatar } from "./Avatar";
import { ThemedText } from "../ThemedText";
const meta = {
    title: "Components/Avatar",
    component: Avatar,
    argTypes: {
        variant: {
            control: "select",
            options: ["small", "large", "xlarge"],
        },
    },
};

export default meta;

export const Default = {
    args: {
        variant: "xlarge",
    },
    render: (args: any) => {
        const contact = {
            id: 1,
            meta_title: "John Doe",
            meta_avatar: "https://github.com/smashchats.png",
        };
        return <Avatar contact={contact} {...args}></Avatar>;
    },
};

export const NoImage = {
    args: {
        variant: "large",
    },
    render: (args: any) => {
        const contact = {
            id: 1,
            meta_title: "John Doe",
        };
        return <Avatar contact={contact} {...args}></Avatar>;
    },
};

export const NoName = {
    args: {
        variant: "small",
    },
    render: (args: any) => {
        const contact = {
            id: 1,
        };
        return (
            <Box>
                <Avatar contact={contact} {...args}></Avatar>
                <ThemedText style={{ marginTop: 20 }}>
                    An unnamed contact has "UC" as initials as in "Unnamed
                    Contact"
                </ThemedText>
            </Box>
        );
    },
};
