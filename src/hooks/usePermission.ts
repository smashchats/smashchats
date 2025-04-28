import { Alert, Linking } from "react-native";
import {
    Camera,
    useCameraPermission,
    useMicrophonePermission,
} from "react-native-vision-camera";

const alertPermission = (permission: "camera" | "microphone") => {
    Alert.alert(
        `${
            permission.charAt(0).toUpperCase() + permission.slice(1)
        } permission not granted`,
        "Please grant permission to use the app.",
        [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "OK",
                onPress: () => {
                    Linking.openSettings();
                },
            },
        ]
    );
};

const usePermission = () => {
    const { requestPermission: requestCameraPermission } =
        useCameraPermission();
    const { requestPermission: requestMicrophonePermission } =
        useMicrophonePermission();

    const guardCameraPermission = async () => {
        const status = Camera.getCameraPermissionStatus();
        let result = false;
        switch (status) {
            case "granted":
                return;
            case "not-determined": // We haven't asked for permission yet
                result = await requestCameraPermission();
                break;
            case "denied":
            case "restricted": // By e.g. parental controls
                break;
        }

        if (!result) {
            alertPermission("camera");
            throw new Error("Camera permission not granted");
        }
    };

    const guardMicrophonePermission = async () => {
        const status = Camera.getMicrophonePermissionStatus();
        let result = false;
        switch (status) {
            case "granted":
                return;
            case "not-determined":
                result = await requestMicrophonePermission();
                break;
            case "denied":
            case "restricted": // By e.g. parental controls
                break;
        }
        if (!result) {
            alertPermission("microphone");
            throw new Error("Microphone permission not granted");
        }
    };

    return {
        guardCameraPermission,
        guardMicrophonePermission,
    };
};

export default usePermission;
