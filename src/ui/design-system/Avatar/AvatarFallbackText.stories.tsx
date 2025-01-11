import { Colors } from "@/src/constants/Colors";
import { AvatarWrapper } from "./AvatarWrapper";
import { AvatarFallbackText as FallbackText } from "./AvatarFallbackText";

const meta = {
    title: "Design System/Avatar",
    component: FallbackText,
    subcomponents: [AvatarWrapper],
    argTypes: {
        name: {
            control: "text",
        },
    },
};

export default meta;

export const AvatarFallbackText = {
    args: {
        name: "John Doe",
    },
    render: (args: any) => (
        <AvatarWrapper bgColor={Colors.purple} size={100}>
            <FallbackText {...args}></FallbackText>
        </AvatarWrapper>
    ),
};
