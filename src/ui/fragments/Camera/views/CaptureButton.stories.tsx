import { useSharedValue } from "react-native-reanimated";
import { CaptureButton } from "./CaptureButton";
import { useRef } from "react";
import { Camera } from "react-native-vision-camera";

const meta = {
    title: "Components/Camera/CaptureButton",
    component: CaptureButton,
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

export const Default = {
    render: (args: any) => {
        const s = useSharedValue(0);
        const camera = useRef<Camera>({
            stopRecording: () => Promise.resolve(),
            startRecording: () => Promise.resolve(),
            takePhoto: () => Promise.resolve(),
        } as unknown as Camera);
        return <CaptureButton camera={camera} cameraZoom={s} {...args} />;
    },
    args: {
        onMediaCaptured: () => console.log("Media captured"),
        setIsPressingButton: () => console.log("Is pressing button"),
        enabled: true,
    },
};

export const Disabled = {
    args: {
        enabled: false,
        onMediaCaptured: () => console.log("Media captured"),
        setIsPressingButton: () => console.log("Is pressing button"),
    },
    render: (args: any) => {
        const s = useSharedValue(0);
        const camera = useRef<Camera>({
            stopRecording: () => Promise.resolve(),
            startRecording: () => Promise.resolve(),
            takePhoto: () => Promise.resolve(),
        } as unknown as Camera);
        return <CaptureButton camera={camera} cameraZoom={s} {...args} />;
    },
};
