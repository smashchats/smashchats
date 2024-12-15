import { View } from "react-native";
import { render } from "@testing-library/react-native";

import { HStack } from "@/src/components/design-system/HStack";

describe("HStack", () => {
    test("Renders correctly", () => {
        const tree = render(
            <HStack>
                <View />
            </HStack>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
