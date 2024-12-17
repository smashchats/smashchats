import { render } from "@testing-library/react-native";
import { AvatarFallbackText } from "@/src/components/design-system/AvatarFallbackText";

describe("AvatarFallbackText", () => {
    test("Renders correctly", () => {
        const tree = render(<AvatarFallbackText name="test" />).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with no name", () => {
        const tree = render(<AvatarFallbackText name={undefined as unknown as string} />).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
