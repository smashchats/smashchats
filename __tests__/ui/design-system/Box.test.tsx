import { render } from "@testing-library/react-native";

import { Box } from "@/src/ui/design-system/layout";
import { BadgeText } from "@/src/ui/design-system/Badge";

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
