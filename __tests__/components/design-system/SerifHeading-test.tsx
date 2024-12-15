import { render } from "@testing-library/react-native";
import { SerifHeading } from "@/src/components/design-system/SerifHeading";

describe("SerifHeading", () => {
    test("Renders correctly", () => {
        const tree = render(
            <SerifHeading>
                Hello
            </SerifHeading>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
