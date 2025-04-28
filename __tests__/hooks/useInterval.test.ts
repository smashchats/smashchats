import { renderHook } from "@testing-library/react-native";

import useInterval from "@/src/hooks/useInterval";

describe("useInterval", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    it("should call the callback after the delay", () => {
        const callback = jest.fn();
        renderHook(() => useInterval(callback, 1000));
        jest.advanceTimersByTime(1500);
        expect(callback).toHaveBeenCalled();
    });

    it("should not call the callback if the delay is null", () => {
        const callback = jest.fn();
        renderHook(() => useInterval(callback, null));
        jest.advanceTimersByTime(1500);
        expect(callback).not.toHaveBeenCalled();
    });

    it("should call the callback twice after the delay", () => {
        const callback = jest.fn();
        renderHook(() => useInterval(callback, 1000));
        jest.advanceTimersByTime(2500);
        expect(callback).toHaveBeenCalledTimes(2);
    });
});
