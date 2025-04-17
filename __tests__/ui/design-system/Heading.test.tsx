import { render } from "@testing-library/react-native";
import { Heading } from "@/src/ui/design-system/Heading";

describe("Heading", () => {
    test("Renders correctly", () => {
        const tree = render(
            <Heading>
                Hello
            </Heading>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
