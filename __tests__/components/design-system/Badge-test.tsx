import { render } from "@testing-library/react-native";
import { Badge } from "@/src/components/design-system/Badge";
import { BadgeText } from "@/src/components/design-system/BadgeText";

describe("Badge", () => {
    test("Renders correctly", () => {
        const tree = render(
            <Badge>
                <BadgeText>Hello</BadgeText>
            </Badge>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with type smashed", () => {
        const tree = render(
            <Badge type="smashed">
                <BadgeText>Hello</BadgeText>
            </Badge>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("Renders correctly with type trusted", () => {
        const tree = render(
            <Badge type="trusted">
                <BadgeText>Hello</BadgeText>
            </Badge>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
