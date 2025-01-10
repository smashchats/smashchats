import { SmashOrPass } from "@/src/ui/components/SmashOrPass";

export default {
    title: "Components/SmashOrPass",
    component: SmashOrPass,
    argTypes: {
        onSmash: { action: "onSmash" },
        onPass: { action: "onPass" },
    },
};

export const Default = {
    args: {
        onSmash: () => {
            console.log("Smash");
        },
        onPass: () => {
            console.log("Pass");
        },
    },
};
