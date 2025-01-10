import { render } from "@testing-library/react-native";
import { Badge, BadgeText } from "@/src/ui/design-system/Badge";

describe("Badge", () => {
    test("Renders correctly", () => {
        const tree = render(
            <Badge>
                <BadgeText>Hello</BadgeText>
            </Badge>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with type selected", () => {
        const tree = render(
            <Badge type="selected">
                <BadgeText>Hello</BadgeText>
            </Badge>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with type disabled", () => {
        const tree = render(
            <Badge type="disabled">
                <BadgeText>Hello</BadgeText>
            </Badge>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
