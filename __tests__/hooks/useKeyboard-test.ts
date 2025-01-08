import { renderHook } from "@testing-library/react-native";

import { useKeyboard } from "@/src/hooks/useKeyboard";
import { Keyboard } from "react-native";

jest.mock("react-native", () => ({
    Keyboard: {
        dismiss: jest.fn(),
        addListener: jest.fn()
    },
}));

describe("useKeyboard", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should return the keyboardVisible state", () => {
        const { result } = renderHook(useKeyboard);
        expect(result.current.keyboardVisible).toBe(false);
    });

    it("should add a keyboardDidShow listener", () => {
        renderHook(useKeyboard);
        expect(Keyboard.addListener).toHaveBeenCalledWith("keyboardDidShow", expect.any(Function));
    });

    it("should add a keyboardDidHide listener", () => {
        renderHook(useKeyboard);
        expect(Keyboard.addListener).toHaveBeenCalledWith("keyboardDidHide", expect.any(Function));
    });

    it("should call the hideKeyboard function", () => {
        const { result } = renderHook(useKeyboard);
        result.current.hideKeyboard();
        expect(Keyboard.dismiss).toHaveBeenCalled();
    });
});
