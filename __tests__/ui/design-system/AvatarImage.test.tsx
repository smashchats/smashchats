import { render } from "@testing-library/react-native";
import { AvatarImage } from "@/src/ui/design-system/Avatar";

describe("AvatarImage", () => {
    test("Renders correctly", () => {
        const tree = render(
            <AvatarImage
                alt={`contact name's avatar`}
                borderRadius={16}
                size={64}
                source={"data:base64,image"}
            />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with no defined size --> default size", () => {
        const tree = render(
            <AvatarImage
                alt={`contact name's avatar`}
                borderRadius={16}
                source={"data:base64,image"}
            />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
