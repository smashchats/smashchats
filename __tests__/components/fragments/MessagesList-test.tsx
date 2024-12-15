import { render } from "@testing-library/react-native";

import { MessagesList } from "@/src/components/fragments/MessagesList.jsx";

describe("MessagesList", () => {
    it("renders correctly", () => {
        const tree = render(<MessagesList messages={[]} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders messages", () => {
        const messages = [
            {
                type: "message",
                content: "Hello, bob!",
                fromMe: true,
                sha256: "123",
                from: "alice",
                date: new Date(),
            },
            {
                type: "message",
                content: "Hello, alice!",
                fromMe: false,
                sha256: "124",
                from: "bob",
                date: new Date(),
            },
        ];
        const tree = render(<MessagesList messages={messages} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
