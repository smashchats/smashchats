const usePermission = () => {
    return {
        guardCameraPermission: () => {
            throw new Error("Camera permission not granted");
        },
        guardMicrophonePermission: () => {
            throw new Error("Microphone permission not granted");
        },
    };
};

export default usePermission;
