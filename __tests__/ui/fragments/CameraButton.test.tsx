import { fireEvent, render } from "@testing-library/react-native";

import { CameraButton } from "@/src/ui/fragments/Camera/CameraButton";

describe("CameraButton", () => {
    describe("render", () => {
        it("renders correctly", () => {
            const tree = render(
                <CameraButton icon="camera" onPress={() => {}} display={true} />
            ).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("does not render when display is false", () => {
            const tree = render(
                <CameraButton
                    icon="camera"
                    onPress={() => {}}
                    display={false}
                />
            ).toJSON();
            expect(tree).toBeNull();
        });
    });

    describe("onPress", () => {
        it("calls onPress when pressed", () => {
            const fn = jest.fn();
            const { getByTestId } = render(
                <CameraButton icon="camera" onPress={fn} display={true} />
            );
            const pressable = getByTestId("CameraButton::Pressable");
            fireEvent.press(pressable);
            expect(fn).toHaveBeenCalled();
        });
    });
});
