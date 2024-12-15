import * as React from "react";
import { useRef, useState, useCallback, useEffect } from "react";
import {
    GestureResponderEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    PinchGestureHandlerGestureEvent,
    PinchGestureHandler,
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

import Reanimated, {
    Extrapolation,
    interpolate,
    useAnimatedGestureHandler,
    useAnimatedProps,
    useSharedValue,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/core";
// ==============================
import {
    CONTENT_SPACING,
    CONTROL_BUTTON_SIZE,
    MAX_ZOOM_FACTOR,
    SAFE_AREA_PADDING,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from "@/src/components/fragments/Camera/Constants";
import { useIsForeground } from "@/src/components/fragments/Camera/hooks/useIsForeground";
import { StatusBarBlurBackground } from "@/src/components/fragments/Camera/views/StatusBarBlurBackground";
import { CaptureButton } from "@/src/components/fragments/Camera/views/CaptureButton";
import StaticSafeAreaInsets from "react-native-static-safe-area-insets";
import {initialWindowMetrics} from 'react-native-safe-area-context';

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
            console.info(`Media captured! ${JSON.stringify(media)}`);
            // TODO: navigate to results page
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

    //#region Effects
    useEffect(() => {
        // Reset zoom to it's default everytime the `device` changes.
        zoom.value = device?.neutralZoom ?? 1;
    }, [zoom, device]);
    //#endregion

    //#region Pinch to Zoom Gesture
    // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
    // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
    const onPinchGesture = useAnimatedGestureHandler<
        PinchGestureHandlerGestureEvent,
        { startZoom?: number }
    >({
        onStart: (_, context) => {
            console.debug("onStart", zoom.value);
            context.startZoom = zoom.value;
        },
        onActive: (event, context) => {
            console.debug("onActive", event.scale);
            // we're trying to map the scale gesture to a linear zoom here
            const startZoom = context.startZoom ?? 0;

            // TODO: if available, switch to fisheye mode using something like this:
            if (startZoom === 1 && event.scale < 1) {
                zoom.value = 0.5;
            } else if (startZoom === 0.5 && event.scale > 1) {
                zoom.value = 1;
            } else if (startZoom === 0.5 && event.scale < 1) {
                // do nothing
            } else {
                const scale = interpolate(
                    event.scale,
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
        },
    });
    //#endregion

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

    return (
        <View style={styles.container}>
            {device != null ? (
                <PinchGestureHandler
                    onGestureEvent={onPinchGesture}
                    enabled={isActive}
                >
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
                </PinchGestureHandler>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.text}>
                        Your phone does not have a Camera.
                    </Text>
                </View>
            )}

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

            <StatusBarBlurBackground />

            <View style={styles.rightButtonRow}>
                <Pressable style={styles.button} onPress={onFlipCameraPressed}>
                    <MaterialCommunityIcons
                        name={"camera-flip"}
                        size={28}
                        color={"white"}
                    />
                </Pressable>
                {supportsFlash && (
                    <Pressable style={styles.button} onPress={onFlashPressed}>
                        <MaterialCommunityIcons
                            name={flash === "on" ? "flash" : "flash-off"}
                            size={28}
                            color={"white"}
                        />
                    </Pressable>
                )}
                {canToggleNightMode && (
                    <Pressable
                        style={styles.button}
                        onPress={() => setEnableNightMode(!enableNightMode)}
                    >
                        <MaterialCommunityIcons
                            name={enableNightMode ? "moon-full" : "moon-new"}
                            size={28}
                            color={"white"}
                        />
                    </Pressable>
                )}
            </View>
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
    button: {
        marginBottom: CONTENT_SPACING,
        width: CONTROL_BUTTON_SIZE,
        height: CONTROL_BUTTON_SIZE,
        borderRadius: CONTROL_BUTTON_SIZE / 2,
        backgroundColor: "rgba(140, 140, 140, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    rightButtonRow: {
        position: "absolute",
        right: SAFE_AREA_PADDING.paddingRight,
        top: SAFE_AREA_PADDING.paddingTop,
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
