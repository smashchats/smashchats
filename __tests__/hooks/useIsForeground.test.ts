import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AppState } from "react-native";

import { useIsForeground } from "@/src/hooks/useIsForeground";


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
        // React Native's own AppState mock no longer returns a subscription, so
        // the spy has to supply one for the hook's cleanup to call .remove() on.
        const appStateSpy = jest
            .spyOn(AppState, "addEventListener")
            .mockReturnValue({ remove: jest.fn() } as never);

        const { result } = renderHook(useIsForeground);
        // Drive the handler inside act(), then assert outside it: under React 19
        // the state update is not guaranteed to be visible mid-act().
        await act(async () => {
            appStateSpy.mock.calls[0][1]("inactive");
        });
        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });
});
