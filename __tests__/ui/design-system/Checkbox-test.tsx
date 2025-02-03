import { render } from "@testing-library/react-native";

import { Checkbox } from "@/src/ui/design-system/Checkbox";

describe("Checkbox", () => {
    it("renders correctly", () => {
        const tree = render(<Checkbox checked={false} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders correctly when checked", () => {
        const tree = render(<Checkbox checked={true} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
