import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AppState } from "react-native";

import { useIsForeground } from "@/src/hooks/useIsForeground";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("useIsForeground", () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.resetAllMocks();
    });

    it("should be true by default", async () => {
        const { result } = renderHook(useIsForeground);
        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it("changes to false when AppState emits 'inactive' status", async () => {
        const appStateSpy = jest.spyOn(AppState, "addEventListener");

        const { result } = renderHook(useIsForeground);
        await act(async () => {
            appStateSpy.mock.calls[0][1]("inactive");
            await sleep(250);
            expect(result.current).toBe(false);
        });
    });
});
