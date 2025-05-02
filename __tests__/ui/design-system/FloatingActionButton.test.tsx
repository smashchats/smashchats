import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);

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
        const pressable = getByTestId("IconButton::camera");
        await act(async () => {
            fireEvent.press(pressable);
        });

        await waitFor(() => {
            expect(fn).toHaveBeenCalled();
        });
    });
});
