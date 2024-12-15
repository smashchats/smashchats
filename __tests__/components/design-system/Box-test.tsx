import { render } from "@testing-library/react-native";

import { Box } from "@/src/components/design-system/Box";
import { BadgeText } from "@/src/components/design-system/BadgeText";

describe("Box", () => {
    test("Renders correctly", () => {
        const tree = render(
            <Box>
                <BadgeText>Hello</BadgeText>
            </Box>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
