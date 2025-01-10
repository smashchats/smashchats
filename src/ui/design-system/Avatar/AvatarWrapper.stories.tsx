import { Colors } from "@/src/constants/Colors";
import { AvatarWrapper as AW } from "./AvatarWrapper";
import { AvatarFallbackText } from "./AvatarFallbackText";
import { AvatarImage } from "./AvatarImage";

const meta = {
    title: "Design System/Avatar",
    component: AW,
    subcomponents: [AvatarFallbackText, AvatarImage],
    argTypes: {
        size: {
            control: "number",
        },
        borderRadius: {
            control: "number",
        },
        bgColor: {
            control: "text",
        },
    },
};

export default meta;

export const AvatarWrapper = {
    args: {
        size: 100,
        borderRadius: 16,
        bgColor: Colors.purple,
    },
    render: (args: any) => (
        <AW {...args}>
            <AvatarFallbackText name="John Doe"></AvatarFallbackText>
        </AW>
    ),
};
