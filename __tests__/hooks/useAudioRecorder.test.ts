import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";

import * as AudioModule from "expo-audio";

import { useAudioRecorder } from "@/src/hooks/useAudioRecorder";
import * as MediaStorage from "@/src/utils/MediaStorage";

jest.mock("expo-audio", () => ({
    useAudioRecorder: jest.fn(() => ({
        prepareToRecordAsync: jest.fn(),
        record: jest.fn(),
        stop: jest.fn(),
        uri: "test-uri",
    })),
    RecordingPresets: {
        HIGH_QUALITY: {},
    },
    AudioModule: {
        requestRecordingPermissionsAsync: jest.fn(() =>
            Promise.resolve({ granted: true })
        ),
    },
    setAudioModeAsync: jest.fn(),
}));

jest.mock("@/src/utils/MediaStorage", () => ({
    saveMediaFromUri: jest.fn(() =>
        Promise.resolve({
            file_path: "test-file-path",
            sha256: "test-sha256",
            mime_type: "audio/m4a",
        })
    ),
}));

jest.mock("react-native", () => {
    return {
        // ...RN,
        Alert: {
            alert: jest.fn(),
        },
    };
});

describe("useAudioRecorder", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should initialize with default values", () => {
        const onRecordingFinished = jest.fn();
        const { result } = renderHook(() =>
            useAudioRecorder({ onRecordingFinished })
        );

        expect(result.current.isRecording).toBe(false);
        expect(result.current.recordingDuration).toBe(0);
        expect(typeof result.current.startRecording).toBe("function");
        expect(typeof result.current.stopRecording).toBe("function");
    });

    it("should request microphone permissions on mount", () => {
        const onRecordingFinished = jest.fn();
        renderHook(() => useAudioRecorder({ onRecordingFinished }));

        expect(
            AudioModule.AudioModule.requestRecordingPermissionsAsync
        ).toHaveBeenCalled();
    });


    it("should handle errors during recording", async () => {
        const onRecordingFinished = jest.fn();
        const { result } = renderHook(() =>
            useAudioRecorder({ onRecordingFinished })
        );

        (
            result.current.audioRecorder.prepareToRecordAsync as jest.Mock
        ).mockRejectedValueOnce(new Error("Test error"));

        await act(async () => {
            await result.current.startRecording();
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            "Error",
            "Failed to start recording"
        );
        expect(result.current.isRecording).toBe(false);
    });

    it("should handle errors during saving recording", async () => {
        (MediaStorage.saveMediaFromUri as jest.Mock).mockRejectedValueOnce(
            new Error("Test error")
        );

        const onRecordingFinished = jest.fn();
        const { result } = renderHook(() =>
            useAudioRecorder({ onRecordingFinished })
        );

        await act(async () => {
            await result.current.startRecording();
        });

        await act(async () => {
            await result.current.stopRecording();
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            "Error",
            "Failed to save audio recording"
        );
        expect(onRecordingFinished).not.toHaveBeenCalled();
    });

    it("should clean up interval on unmount", () => {
        const onRecordingFinished = jest.fn();
        const { result, unmount } = renderHook(() =>
            useAudioRecorder({ onRecordingFinished })
        );

        act(() => {
            result.current.startRecording();
        });

        unmount();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(result.current.recordingDuration).toBe(0);
    });
});
