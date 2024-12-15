import { render } from "@testing-library/react-native";
import { Heading } from "@/src/components/design-system/Heading.jsx";

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
