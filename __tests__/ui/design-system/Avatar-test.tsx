import { render } from "@testing-library/react-native";
import {
    AvatarWrapper,
    AvatarImage,
    AvatarFallbackText,
} from "@/src/ui/design-system/Avatar";
import { Colors } from "@/src/constants/Colors";

describe("Avatar", () => {
    test("Renders correctly", () => {
        const tree = render(<AvatarWrapper size={100} />).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with image", () => {
        const tree = render(
            <AvatarWrapper bgColor={Colors.purple}>
                <AvatarImage
                    alt={`contact name's avatar`}
                    borderRadius={16}
                    size={64}
                    source={"data:base64,image"}
                />
            </AvatarWrapper>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with fallback text", () => {
        const tree = render(
            <AvatarWrapper bgColor={Colors.purple}>
                <AvatarFallbackText name={"contact name"} />
            </AvatarWrapper>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
