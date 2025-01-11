import { useSharedValue } from "react-native-reanimated";
import { CaptureButton as CaptureBtn, Props } from "./CaptureButton";
import { useRef } from "react";
import { Camera } from "react-native-vision-camera";

const meta = {
    title: "Components/Camera/CaptureButton",
    component: CaptureBtn,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        setIsPressingButton: {
            action: "setIsPressingButton",
            control: null,
        },
        onMediaCaptured: {
            action: "onMediaCaptured",
            control: null,
        },
    },
};

export default meta;

const CameraWrapper: React.FC<Props> = (args) => {
    const camera = useRef<Camera>({
        stopRecording: () => Promise.resolve(),
        startRecording: () => Promise.resolve(),
        takePhoto: () => Promise.resolve(),
    } as unknown as Camera);
    const s = useSharedValue(0);
    return <CaptureBtn {...args} camera={camera} cameraZoom={s} />;
};

export const CaptureButton = {
    render: (args: any) => <CameraWrapper {...args} />,
    args: {
        onMediaCaptured: () => console.log("Media captured"),
        setIsPressingButton: () => console.log("Is pressing button"),
        enabled: true,
    },
};
