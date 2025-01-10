import { Colors } from "@/src/constants/Colors";
import { AvatarWrapper } from "./AvatarWrapper";
import { AvatarFallbackText as AFT } from "./AvatarFallbackText";

const meta = {
    title: "Design System/Avatar",
    component: AFT,
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
            <AFT {...args}></AFT>
        </AvatarWrapper>
    ),
};
