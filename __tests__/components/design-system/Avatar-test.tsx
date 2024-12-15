import { render } from "@testing-library/react-native";
import { Avatar } from "@/src/components/design-system/Avatar.jsx";
import { AvatarImage } from "@/src/components/design-system/AvatarImage";
import { Colors } from "@/src/constants/Colors";
import { AvatarFallbackText } from "@/src/components/design-system/AvatarFallbackText";

describe("Avatar", () => {
    test("Renders correctly", () => {
        const tree = render(<Avatar size={100} />).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with image", () => {
        const tree = render(
            <Avatar bgColor={Colors.purple}>
                <AvatarImage
                    alt={`contact name's profile picture`}
                    borderRadius={16}
                    size={64}
                    source={"data:base64,image"}
                />
            </Avatar>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with fallback text", () => {
        const tree = render(
            <Avatar bgColor={Colors.purple}>
                <AvatarFallbackText name={"contact name"} />
            </Avatar>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
