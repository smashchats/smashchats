import { Colors } from "@/src/constants/Colors";
import { AvatarWrapper } from "./AvatarWrapper";
import { AvatarImage as AvatarImageComponent } from "./AvatarImage";

const meta = {
    title: "Design System/Avatar",
    component: AvatarImageComponent,
    subcomponents: [AvatarWrapper],
    argTypes: {
        source: {
            control: "text",
        },
        transition: {
            control: "number",
        },
        alt: {
            control: "text",
        },
        size: {
            control: "number",
        },
    },
};

export default meta;

export const AvatarImage = {
    args: {
        source: "https://github.com/smashchats.png",
        transition: 1000,
        alt: "Smashchats Avatar",
        size: 100,
    },
    render: (args: any) => (
        <AvatarWrapper bgColor={Colors.dark.textGray} size={100}>
            <AvatarImageComponent {...args}></AvatarImageComponent>
        </AvatarWrapper>
    ),
};
