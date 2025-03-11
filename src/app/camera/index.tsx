import * as React from "react";
import { useRef, useState, useCallback, useEffect } from "react";
import { GestureResponderEvent, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";
import {
    Gesture,
    GestureDetector,
    TapGestureHandler,
} from "react-native-gesture-handler";
import {
    CameraProps,
    CameraRuntimeError,
    PhotoFile,
    VideoFile,
    Camera,
    useCameraDevice,
    useCameraFormat,
    useLocationPermission,
    useMicrophonePermission,
    useCameraDevices,
} from "react-native-vision-camera";
import StaticSafeAreaInsets from "react-native-static-safe-area-insets";
import { initialWindowMetrics } from "react-native-safe-area-context";
import Reanimated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedProps,
    useSharedValue,
} from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/core";
// ==============================
import {
    MAX_ZOOM_FACTOR,
    SAFE_AREA_PADDING,
} from "@/src/ui/fragments/Camera/Constants";
import { useIsForeground } from "@/src/hooks/useIsForeground";
import { CaptureButton } from "@/src/ui/fragments/Camera/views";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/src/ui/constants";
import {
    CameraButtonGroup,
    CameraButtonProps,
} from "@/src/ui/fragments/Camera/CameraButton";
import { MediaPath } from "@/src/types/";
import { MediaArtboard } from "@/src/ui/fragments/Camera/views/MediaArtboard";

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
    zoom: true,
});

const SCALE_FULL_ZOOM = 3;

export default function CameraLayout() {
    const camera = useRef<Camera>(null);
    const [isCameraInitialized, setIsCameraInitialized] = useState(false);
    const microphone = useMicrophonePermission();
    const location = useLocationPermission();
    const zoom = useSharedValue(1);
    const isPressingButton = useSharedValue(false);

    const [mediaPath, setMediaPath] = useState<MediaPath | null>(null);

    const [muteVideo, setMuteVideo] = useState(false);

    const devices = useCameraDevices();
    useEffect(() => {
        console.log(
            "front",
            devices
                .filter((d) => d.position === "front")
                .map((d) => {
                    const out: any = { ...d };
                    delete out.formats;
                    return out;
                })
        );
        console.log(
            "back",
            devices
                .filter((d) => d.position === "back")
                .map((d) => {
                    const out: any = { ...d };
                    delete out.formats;
                    return out;
                })
        );

        StaticSafeAreaInsets.getSafeAreaInsets(console.log);
        console.log(initialWindowMetrics?.insets);
    }, [devices]);

    // check if camera page is active
    const isFocussed = useIsFocused();
    const isForeground = useIsForeground();
    const isActive = isFocussed && isForeground;

    const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
        "back"
    );
    const [flash, setFlash] = useState<"off" | "on">("off");
    const [enableNightMode, setEnableNightMode] = useState(false);

    // camera device settings
    let device = useCameraDevice(cameraPosition);

    const screenAspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
    const format = useCameraFormat(device, [
        { fps: 30 },
        { videoAspectRatio: screenAspectRatio },
        { videoResolution: "max" },
        { photoAspectRatio: screenAspectRatio },
        { photoResolution: "max" },
    ]);

    const supportsFlash = device?.hasFlash ?? false;
    const canToggleNightMode = device?.supportsLowLightBoost ?? false;

    //#region Animated Zoom
    const minZoom = device?.minZoom ?? 1;
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

    const cameraAnimatedProps = useAnimatedProps<CameraProps>(() => {
        const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
        return {
            zoom: z,
        };
    }, [maxZoom, minZoom, zoom]);
    //#endregion

    //#region Callbacks
    const setIsPressingButton = useCallback(
        (_isPressingButton: boolean) => {
            isPressingButton.value = _isPressingButton;
        },
        [isPressingButton]
    );
    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error);
    }, []);
    const onInitialized = useCallback(() => {
        console.debug("Camera initialized!");
        setIsCameraInitialized(true);
    }, []);
    const onMediaCaptured = useCallback(
        (media: PhotoFile | VideoFile, type: "photo" | "video") => {
            console.info(`Media (${type}) captured! ${JSON.stringify(media)}`);
            setMediaPath({ type, path: media.path });
        },
        []
    );
    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === "back" ? "front" : "back"));
    }, []);
    const onFlashPressed = useCallback(() => {
        setFlash((f) => (f === "off" ? "on" : "off"));
    }, []);
    //#endregion

    //#region Tap Gesture
    const onFocusTap = useCallback(
        ({ nativeEvent: event }: GestureResponderEvent) => {
            if (!device?.supportsFocus) return;
            camera.current?.focus({
                x: event.locationX,
                y: event.locationY,
            });
        },
        [device?.supportsFocus]
    );
    const onDoubleTap = useCallback(() => {
        onFlipCameraPressed();
    }, [onFlipCameraPressed]);
    //#endregion

    //#region Pinch to Zoom Gesture
    const [startZoom, setStartZoom] = useState(1);
    // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
    // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
    const onPinchGestureChange = (eventScale: number) => {
        // we're trying to map the scale gesture to a linear zoom here

        if (startZoom === 1 && eventScale < 1) {
            zoom.value = 0.5;
        } else if (startZoom === 0.5 && eventScale > 1) {
            zoom.value = 1;
        } else if (startZoom === 0.5 && eventScale < 1) {
            // do nothing
        } else {
            const scale = interpolate(
                eventScale,
                [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
                [-1, 0, 1],
                Extrapolation.CLAMP
            );
            zoom.value = interpolate(
                scale,
                [-1, 0, 1],
                [minZoom, startZoom, maxZoom],
                Extrapolation.CLAMP
            );
        }
    };
    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            console.debug("onStart", zoom.value);
            runOnJS(setStartZoom)(zoom.value);
        })
        .onChange((event) => {
            console.debug("onChange", event.scale);
            runOnJS(onPinchGestureChange)(event.scale);
        });
    //#endregion

    //#region Effects
    useEffect(() => {
        // Reset zoom to it's default everytime the `device` changes.
        zoom.value = device?.neutralZoom ?? 1;
        setStartZoom(zoom.value);
    }, [zoom, device]);

    useEffect(() => {
        const f =
            format != null
                ? `(${format.photoWidth}x${format.photoHeight} photo / ${
                      format.videoWidth
                  }x${format.videoHeight}@${format.maxFps} video @ ${30}fps)`
                : undefined;
        console.debug(`Camera: ${device?.name} | Format: ${f}`);
    }, [device?.name, format]);

    useEffect(() => {
        location.requestPermission();
    }, [location]);
    //#endregion

    const mode: "no-camera" | "camera" | "media" = (() => {
        switch (true) {
            case device == null:
                return "no-camera";
            case mediaPath == null:
                return "camera";
            default:
                return "media";
        }
    })();

    const rightCameraButtons: CameraButtonProps[] = [
        {
            icon: "camera-flip",
            onPress: onFlipCameraPressed,
            display: mode === "camera",
        },
        {
            icon: flash === "on" ? "flash" : "flash-off",
            onPress: onFlashPressed,
            display: supportsFlash && mode === "camera",
        },
        {
            icon: enableNightMode ? "moon-full" : "moon-new",
            onPress: () => setEnableNightMode(!enableNightMode),
            display: canToggleNightMode && mode === "camera",
        },
        {
            icon: muteVideo ? "volume-off" : "volume-high",
            onPress: () => setMuteVideo(!muteVideo),
            display: mode === "media" && mediaPath?.type === "video",
        },
    ];

    const leftCameraButtons: CameraButtonProps[] = [
        {
            icon: "chevron-left",
            onPress: () => router.back(),
            display: mode !== "media",
        },
    ];

    const bottomCameraButtons: CameraButtonProps[] = [
        {
            icon: "send",
            onPress: () => {
                router.push({
                    pathname: "/camera/send",
                    params: {
                        mediaPath: mediaPath?.path,
                        mediaType: mediaPath?.type,
                        isMuted: muteVideo ? "true" : "false",
                    },
                });
            },
            display: mode === "media",
        },
    ];

    return (
        <View style={styles.container}>
            {mode == "no-camera" && (
                <View style={styles.container}>
                    <Text style={styles.text}>
                        Your phone does not have a camera
                    </Text>
                </View>
            )}
            {mode == "camera" && device != null && (
                <GestureDetector gesture={pinchGesture}>
                    <Reanimated.View
                        onTouchEnd={onFocusTap}
                        style={StyleSheet.absoluteFill}
                    >
                        <TapGestureHandler
                            onEnded={onDoubleTap}
                            numberOfTaps={2}
                        >
                            <ReanimatedCamera
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={isActive}
                                ref={camera}
                                onInitialized={onInitialized}
                                onError={onError}
                                onStarted={() =>
                                    console.debug("Camera started!")
                                }
                                onStopped={() =>
                                    console.debug("Camera stopped!")
                                }
                                onPreviewStarted={() =>
                                    console.debug("Preview started!")
                                }
                                onPreviewStopped={() =>
                                    console.debug("Preview stopped!")
                                }
                                onOutputOrientationChanged={(o) =>
                                    console.debug(
                                        `Output orientation changed to ${o}!`
                                    )
                                }
                                onPreviewOrientationChanged={(o) =>
                                    console.debug(
                                        `Preview orientation changed to ${o}!`
                                    )
                                }
                                onUIRotationChanged={(degrees) =>
                                    console.debug(
                                        `UI Rotation changed: ${degrees}°`
                                    )
                                }
                                format={format}
                                fps={30}
                                photoQualityBalance="speed"
                                lowLightBoost={
                                    device.supportsLowLightBoost &&
                                    enableNightMode
                                }
                                videoStabilizationMode={"off"}
                                enableZoomGesture={false}
                                animatedProps={cameraAnimatedProps}
                                exposure={0}
                                enableFpsGraph={false}
                                outputOrientation="device"
                                photo={true}
                                video={true}
                                audio={microphone.hasPermission}
                            />
                        </TapGestureHandler>
                    </Reanimated.View>
                </GestureDetector>
            )}
            {mode == "media" && mediaPath != null && (
                <MediaArtboard
                    mediaPath={mediaPath}
                    onClose={() => setMediaPath(null)}
                />
            )}

            {mode == "camera" && (
                <CaptureButton
                    style={styles.captureButton}
                    camera={camera}
                    onMediaCaptured={onMediaCaptured}
                    cameraZoom={zoom}
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    flash={supportsFlash ? flash : "off"}
                    enabled={isCameraInitialized && isActive}
                    setIsPressingButton={setIsPressingButton}
                />
            )}

            <CameraButtonGroup
                buttons={leftCameraButtons}
                style={styles.leftButtonRow}
            />
            <CameraButtonGroup
                buttons={rightCameraButtons}
                style={styles.rightButtonRow}
            />
            <CameraButtonGroup
                buttons={bottomCameraButtons}
                style={styles.bottomButtonRow}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    captureButton: {
        position: "absolute",
        alignSelf: "center",
        bottom: SAFE_AREA_PADDING.paddingBottom,
    },
    rightButtonRow: {
        position: "absolute",
        right: SAFE_AREA_PADDING.paddingRight,
        top: SAFE_AREA_PADDING.paddingTop,
    },
    leftButtonRow: {
        position: "absolute",
        left: SAFE_AREA_PADDING.paddingLeft,
        top: SAFE_AREA_PADDING.paddingTop,
    },
    bottomButtonRow: {
        position: "absolute",
        bottom: SAFE_AREA_PADDING.paddingBottom,
        right: SAFE_AREA_PADDING.paddingRight,
    },
    text: {
        color: "white",
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
