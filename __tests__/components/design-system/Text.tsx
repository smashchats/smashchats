import { render } from "@testing-library/react-native";

import { Text } from "@/src/components/design-system/Text";

describe("Box", () => {
    test("Renders correctly", () => {
        const tree = render(<Text>Hello</Text>).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
