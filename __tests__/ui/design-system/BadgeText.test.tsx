import { render } from "@testing-library/react-native";
import { BadgeText } from "@/src/ui/design-system/Badge";

describe("BadgeText", () => {
    test("Renders correctly", () => {
        const tree = render(<BadgeText>Hello</BadgeText>).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
