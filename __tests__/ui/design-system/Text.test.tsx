import { render } from "@testing-library/react-native";

import { Text } from "@/src/ui/design-system/Text";

describe("Text", () => {
    test("Renders correctly", () => {
        const tree = render(<Text>Hello</Text>).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
