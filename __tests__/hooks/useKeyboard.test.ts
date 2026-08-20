import { renderHook } from "@testing-library/react-native";

import { useKeyboard } from "@/src/hooks/useKeyboard";
import { Keyboard } from "react-native";

let mockMasterUnsubscription = jest.fn();

jest.mock("react-native", () => ({
    Keyboard: {
        dismiss: jest.fn(),
        addListener: jest.fn()
            .mockImplementation(() => ({ remove: mockMasterUnsubscription })),
    },
}));

describe("useKeyboard", () => {
    beforeEach(() => {
        mockMasterUnsubscription = jest.fn();
        // afterEach calls jest.resetAllMocks(), which strips the implementation
        // set in the module factory above. Re-establish it for every test so
        // addListener keeps returning a subscription with .remove().
        (Keyboard.addListener as jest.Mock).mockImplementation(() => ({
            remove: mockMasterUnsubscription,
        }));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should remove the keyboardDidShow listener", () => {
        const { unmount } = renderHook(useKeyboard);
        unmount();
        expect(mockMasterUnsubscription).toHaveBeenCalled();
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
