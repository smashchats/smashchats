import { act, fireEvent, render } from "@testing-library/react-native";
import { FloatingActionButton } from "@/src/ui/design-system/FloatingActionButton";

describe("FloatingActionButton", () => {
    test("Renders correctly", () => {
        const tree = render(
            <FloatingActionButton icon="camera" onPress={() => {}} />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
    test("Can click", async () => {
        const fn = jest.fn();
        const { getByTestId } = render(
            <FloatingActionButton icon="camera" onPress={fn} />
        );
        const pressable = getByTestId("FloatingActionButton::Pressable");
        await act(async () => {
            fireEvent.press(pressable);
        });

        expect(fn).toHaveBeenCalled();
    });
});
