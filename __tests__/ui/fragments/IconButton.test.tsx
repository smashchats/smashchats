import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { IconButton } from "@/src/ui/components/IconButton";

describe("IconButton Component", () => {
    it("should match snapshot with 'home' icon", () => {
        const { toJSON } = render(
            <IconButton icon="home" onPress={() => {}} />
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it("should match snapshot with 'cog' icon", () => {
        const { toJSON } = render(<IconButton icon="cog" onPress={() => {}} />);
        expect(toJSON()).toMatchSnapshot();
    });

    it("should call onPress when pressed", () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(
            <IconButton icon="home" onPress={onPressMock} />
        );
        const button = getByTestId("IconButton::home");
        fireEvent.press(button);
        expect(onPressMock).toHaveBeenCalled();
    });
});
