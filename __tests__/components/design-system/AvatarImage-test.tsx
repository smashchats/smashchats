import { render } from "@testing-library/react-native";
import { AvatarImage } from "@/src/components/design-system/AvatarImage";

describe("AvatarImage", () => {
    test("Renders correctly", () => {
        const tree = render(
            <AvatarImage
                alt={`contact name's profile picture`}
                borderRadius={16}
                size={64}
                source={"data:base64,image"}
            />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
