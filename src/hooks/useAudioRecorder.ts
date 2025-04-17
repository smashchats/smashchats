import { useState, useRef, useEffect } from "react";
import { Alert } from "react-native";
import {
    useAudioRecorder as useExpoAudioRecorder,
    RecordingPresets,
    AudioModule,
    setAudioModeAsync,
} from "expo-audio";
import { saveMediaFromUri, MediaMetadata } from "@/src/utils/MediaStorage";

interface UseAudioRecorderProps {
    onRecordingFinished: (audioMetadata: MediaMetadata) => Promise<void>;
}

export const useAudioRecorder = ({
    onRecordingFinished,
}: UseAudioRecorderProps) => {
    const audioRecorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const durationInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert(
                    "Permission required",
                    "Please grant microphone access to record audio messages."
                );
            }
        })();

        return () => {
            if (durationInterval.current) {
                clearInterval(durationInterval.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            await setAudioModeAsync({
                playsInSilentMode: true,
                shouldRouteThroughEarpiece: true,
                allowsRecording: true,
                shouldPlayInBackground: true,
            });

            await audioRecorder.prepareToRecordAsync({
                ...RecordingPresets.HIGH_QUALITY,
                isMeteringEnabled: true,
            });
            audioRecorder.record();
            setIsRecording(true);
            setRecordingDuration(0);

            // Start duration timer
            durationInterval.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording", err);
            Alert.alert("Error", "Failed to start recording");
        }
    };

    const stopRecording = async () => {
        try {
            // Clear duration timer
            if (durationInterval.current) {
                clearInterval(durationInterval.current);
                durationInterval.current = null;
            }

            await audioRecorder.stop();
            setIsRecording(false);
            setRecordingDuration(0);

            const uri = audioRecorder.uri;
            if (uri) {
                console.debug("Recording saved at:", uri);

                await handleRecordingFinished(uri);
            }
        } catch (err) {
            console.error("Failed to stop recording", err);
            Alert.alert("Error", "Failed to stop recording");
        }
    };

    const handleRecordingFinished = async (uri: string) => {
        try {
            const audioMetadata = await saveMediaFromUri(
                uri,
                "audio/m4a",
                "audio",
                { duration: recordingDuration }
            );

            await onRecordingFinished(audioMetadata);

            setRecordingDuration(0);
            setIsRecording(false);
        } catch (error) {
            console.error("Error handling recording finished:", error);
            Alert.alert("Error", "Failed to save audio recording");
        }
    };

    return {
        isRecording,
        recordingDuration,
        startRecording,
        stopRecording,
    };
};
