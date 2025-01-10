import { render } from "@testing-library/react-native";

import { RenderMessageListItem } from "@/src/ui/fragments/MessagesList";
import { DisplayableMessage } from "@/src/types/";
import { IM_CHAT_TEXT } from "@smashchats/library";

describe("RenderMessageListItem", () => {
    it("renders correctly", () => {
        const tree = render(
            <RenderMessageListItem message={{} as DisplayableMessage} />
        ).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders messages", () => {
        const messages = [
            {
                type: IM_CHAT_TEXT,
                content: "Hello, bob!",
                fromMe: true,
                sha256: "123",
                from: "alice",
                date: new Date(),
            },
            {
                type: IM_CHAT_TEXT,
                content: "Hello, alice!",
                fromMe: false,
                sha256: "124",
                from: "bob",
                date: new Date(),
            },
        ];
        let tree;

        messages.forEach((message) => {
            tree = render(<RenderMessageListItem message={message} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
