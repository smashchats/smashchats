import { render } from "@testing-library/react-native";
import { AvatarFallbackText } from "@/src/components/design-system/AvatarFallbackText";

describe("AvatarFallbackText", () => {
    test("Renders correctly", () => {
        const tree = render(<AvatarFallbackText name="test" />).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
