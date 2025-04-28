import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";

import { Camera } from "react-native-vision-camera";

import usePermission from "@/src/hooks/usePermission";

jest.mock("react-native-vision-camera", () => ({
    Camera: {
        getCameraPermissionStatus: jest.fn(() => "not-determined"),
        getMicrophonePermissionStatus: jest.fn(() => "not-determined"),
    },
    useCameraPermission: jest.fn(() => ({
        requestPermission: jest.fn(() => Promise.resolve(true)),
    })),
    useMicrophonePermission: jest.fn(() => ({
        requestPermission: jest.fn(() => Promise.resolve(true)),
    })),
}));

jest.mock("react-native", () => ({
    Alert: {
        alert: jest.fn(),
    },
    Linking: {
        openSettings: jest.fn(),
    },
}));

describe("usePermission", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("guardCameraPermission", () => {
        it("should request camera permission if not determined", async () => {
            (Camera.getCameraPermissionStatus as jest.Mock).mockReturnValue(
                "not-determined"
            );
            const { result } = renderHook(() => usePermission());

            await act(async () => {
                await result.current.guardCameraPermission();
            });

            expect(Camera.getCameraPermissionStatus).toHaveBeenCalled();
            expect(result.current.guardCameraPermission).toBeDefined();
        });

        it("should alert if camera permission is denied", async () => {
            (Camera.getCameraPermissionStatus as jest.Mock).mockReturnValue(
                "denied"
            );
            const { result } = renderHook(() => usePermission());

            expect(async () => {
                await result.current.guardCameraPermission();
            }).rejects.toThrow();

            expect(Camera.getCameraPermissionStatus).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith(
                "Camera permission not granted",
                "Please grant permission to use the app.",
                expect.any(Array)
            );
        });
    });

    describe("guardMicrophonePermission", () => {
        it("should request microphone permission if not determined", async () => {
            (Camera.getMicrophonePermissionStatus as jest.Mock).mockReturnValue(
                "not-determined"
            );
            const { result } = renderHook(() => usePermission());

            await act(async () => {
                await result.current.guardMicrophonePermission();
            });

            expect(Camera.getMicrophonePermissionStatus).toHaveBeenCalled();
            expect(result.current.guardMicrophonePermission).toBeDefined();
        });

        it("should alert if microphone permission is denied", async () => {
            (Camera.getMicrophonePermissionStatus as jest.Mock).mockReturnValue(
                "denied"
            );
            const { result } = renderHook(() => usePermission());

            expect(async () => {
                await result.current.guardMicrophonePermission();
            }).rejects.toThrow();

            expect(Camera.getMicrophonePermissionStatus).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith(
                "Microphone permission not granted",
                "Please grant permission to use the app.",
                expect.any(Array)
            );
        });
    });
});
