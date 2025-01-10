import { ThemedText } from "./ThemedText";

const meta = {
    title: "Components/ThemedText",
    component: ThemedText,
    argTypes: {
        children: {
            control: "text",
        },
        style: {
            control: "object"
        }
    }
};

export default meta;

export const Default = {
    args: {
        children: "Sample Text"
    }
};

export const WithCustomStyle = {
    args: {
        children: "Custom Styled Text",
        style: {
            fontSize: 20,
            fontWeight: "bold"
        }
    }
};
