import { fireEvent, render } from "@testing-library/react-native";
import { FloatingActionButton } from "@/src/components/design-system/FloatingActionButton.jsx";

describe("FloatingActionButton", () => {
    test("Renders correctly", () => {
        const tree = render(
            <FloatingActionButton icon="camera" onPress={() => {}} />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
    test("Can click", () => {
        const fn = jest.fn();
        const { getByTestId } = render(
            <FloatingActionButton icon="camera" onPress={fn} />
        );
        const pressable = getByTestId("FloatingActionButton::Pressable");
        fireEvent.press(pressable);

        expect(fn).toHaveBeenCalled();
    });
});
