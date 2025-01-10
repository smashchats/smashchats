import { Colors } from "@/src/constants/Colors";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "@/src/ui/components/ThemedText";

const meta = {
    title: "Components/ThemedView",
    component: ThemedView,
    argTypes: {
        style: {
            control: "object",
        },
        lightColor: {
            control: "color",
        },
        darkColor: {
            control: "color",
        },
    },
};

export default meta;

export const Default = {
    render: (args: any) => (
        <ThemedView {...args}>
            <ThemedText>Content goes here</ThemedText>
        </ThemedView>
    ),
};

export const WithCustomStyle = {
    args: {
        style: {
            padding: 20,
            backgroundColor: Colors.purple,
            borderRadius: 8,
            borderWidth: 1,
        },
    },
    render: (args: any) => (
        <ThemedView {...args}>
            <ThemedText>Styled view</ThemedText>
        </ThemedView>
    ),
};
