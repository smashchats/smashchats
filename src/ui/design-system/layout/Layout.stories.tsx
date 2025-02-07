import { Box as B } from "./Box";
import { HStack as H } from "./HStack";
import { VStack as V } from "./VStack";
import { ThemedText } from "@/src/ui/components/ThemedText";
import { Colors } from "@/src/constants/Colors";

const meta = {
    title: "Design System/Layout",
    component: B,
    subcomponents: { B, H, V, ThemedText },
    argTypes: {
        children: {
            control: "text",
        },
    },
};

export default meta;

export const Box = {
    render: (args: any) => (
        <B {...args}>
            <ThemedText>Layout children</ThemedText>
        </B>
    ),
};

export const BoxWithCustomStyle = {
    render: (args: any) => (
        <B {...args}>
            <ThemedText>Custom Styled Layout</ThemedText>
            <ThemedText>Child 2</ThemedText>
            <ThemedText>Child 3</ThemedText>
        </B>
    ),
    args: {
        bg: Colors.purple,
        padding: 20,
        borderRadius: 8,
    },
};

export const HStack = {
    render: (args: any) => (
        <H {...args}>
            <ThemedText>HStack Child 1</ThemedText>
            <ThemedText>HStack Child 2</ThemedText>
        </H>
    ),
};

export const VStack = {
    render: (args: any) => (
        <V {...args}>
            <ThemedText>VStack Child 1</ThemedText>
            <ThemedText>VStack Child 2</ThemedText>
        </V>
    ),
};
