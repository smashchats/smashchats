import { NeonText } from "./NeonText";

const meta = {
    title: "Components/NeonText",
    component: NeonText,
    argTypes: {
        text: {
            control: "text",
        },
    },
};

export default meta;

export const Default = {
    args: {
        text: "Neon Text",
    },
};

export const LongText = {
    args: {
        text: "This is a longer neon text example",
    },
};

export const ShortText = {
    args: {
        text: "Neon",
    },
};
