import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

import { BackButton, BareBackButton } from "@/src/ui/fragments/BackButton";


jest.mock("expo-router", () => {
    const backMock = jest.fn();
    return {
        useRouter: () => ({
            back: backMock,
            isReady: true,
        }),
        __backMock: backMock, // Expose the mock for testing
    };
});

describe("BackButton", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders BackButton correctly", () => {
        const { toJSON } = render(<BackButton />);
        expect(toJSON()).toMatchSnapshot();
    });

    it("renders BareBackButton correctly", () => {
        const { toJSON } = render(<BareBackButton />);
        expect(toJSON()).toMatchSnapshot();
    });

    it("calls onPress when BackButton is pressed", () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(<BackButton onPress={onPressMock} />);
        const button = getByTestId("IconButton::arrow-left");
        fireEvent.press(button);
        expect(onPressMock).toHaveBeenCalled();
    });

    it("calls onPress when BareBackButton is pressed", () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(
            <BareBackButton onPress={onPressMock} />
        );
        const button = getByTestId("IconButton::arrow-left");
        fireEvent.press(button);
        expect(onPressMock).toHaveBeenCalled();
    });

    it("calls router.back when BareBackButton is pressed", () => {
        const { __backMock } = require("expo-router");

        const { getByTestId } = render(<BareBackButton />);
        const button = getByTestId("IconButton::arrow-left");
        fireEvent.press(button);
        expect(__backMock).toHaveBeenCalled();
    });
});
