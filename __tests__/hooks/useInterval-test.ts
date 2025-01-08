import { renderHook } from "@testing-library/react-native";

import useInterval from "@/src/hooks/useInterval";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("useInterval", () => {
    it("should call the callback after the delay", async () => {
        const callback = jest.fn();
        renderHook(() => useInterval(callback, 1000));
        await sleep(1500);
        expect(callback).toHaveBeenCalled();
    });

    it("should not call the callback if the delay is null", async () => {
        const callback = jest.fn();
        renderHook(() => useInterval(callback, null));
        await sleep(1500);
        expect(callback).not.toHaveBeenCalled();
    });

    it("should call the callback twice after the delay", async () => {
        const callback = jest.fn();
        renderHook(() => useInterval(callback, 1000));
        await sleep(2500);
        expect(callback).toHaveBeenCalledTimes(2);
    });
});
