import * as React from "react";
import { useRef, useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Keyboard } from "react-native";

import { v7 as uuidv7 } from "uuid";
import {
    Canvas,
    Image,
    ImageShader,
    Fill,
    useImage,
    useVideo,
    Path,
    SkPath,
    Skia,
} from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SharedValue, runOnJS, useSharedValue } from "react-native-reanimated";
// ==============================
import { Colors } from "@/src/constants/Colors";
import { DrawingPath, MediaPath } from "@/src/types/";
import {
    CameraButtonGroup,
    CameraButtonProps,
} from "@/src/ui/fragments/Camera/CameraButton";
import { SAFE_AREA_PADDING } from "@/src/ui/fragments/Camera/Constants";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/src/ui/constants";

type Props = {
    mediaPath: MediaPath;
    onClose: () => void;
};

const ImageArtboard = ({ path }: { path: string }) => {
    const image = useImage(`file://${path}`);

    return (
        <Image
            image={image}
            fit="cover"
            x={0}
            y={0}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
        />
    );
};

const VideoArtboard = ({
    path,
    paused,
}: {
    path: string;
    paused: SharedValue<boolean>;
}) => {
    const { currentFrame, rotation } = useVideo(`file://${path}`, {
        paused,
    });

    return (
        <View style={{ transform: [{ rotate: `${rotation}deg` }] }}>
            <Fill>
                <ImageShader
                    image={currentFrame}
                    fit="cover"
                    x={0}
                    y={0}
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                />
            </Fill>
        </View>
    );
};

export function MediaArtboard({ mediaPath, onClose }: Readonly<Props>) {
    const [mode, setMode] = useState<"text" | "draw" | "none">("none");
    const [text, setText] = useState("");
    const inputRef = useRef<TextInput>(null);
    const [minInputHeight, setMinInputHeight] = useState(18);

    const paused = useSharedValue(false);

    const setTextMode = () => {
        setMode("text");
        inputRef.current?.focus();
    };

    const tapGesture = Gesture.Tap().onStart(() => {
        runOnJS(setTextMode)();
    });

    //#region Drawing - Pan Gesture
    const [paths, setPaths] = useState<DrawingPath[]>([]);
    const currentDrawingPath = useSharedValue<SkPath>(Skia.Path.Make());
    const [current, setCurrent] = useState<SkPath>(Skia.Path.Make());

    const appendPath = (path: SkPath, color: string) => {
        const uuid = uuidv7();
        setPaths([...paths, { path, color, id: uuid }]);
        setCurrent(Skia.Path.Make());
    };

    const drawing = Gesture.Pan()
        .onStart((g) => {
            currentDrawingPath.value.moveTo(g.x, g.y);
            runOnJS(setCurrent)(currentDrawingPath.value);
        })
        .onChange((g) => {
            const currentPath = currentDrawingPath.value;
            if (currentPath == null) return;
            const lastPoint = currentPath.getLastPt();
            const xMid = (lastPoint.x + g.x) / 2;
            const yMid = (lastPoint.y + g.y) / 2;

            currentPath.quadTo(lastPoint.x, lastPoint.y, xMid, yMid);

            currentDrawingPath.value = currentPath;
            runOnJS(setCurrent)(currentPath);
        })
        .onEnd(() => {
            runOnJS(appendPath)(currentDrawingPath.value, Colors.purple);
            currentDrawingPath.value = Skia.Path.Make();
        })
        .minDistance(1);
    //#endregion

    const rightCameraButtons: CameraButtonProps[] = [
        {
            icon: "check",
            onPress: () => setMode("none"),
            display: mode === "draw",
        },
        {
            icon: "undo",
            onPress: () => setPaths(paths.slice(0, -1)),
            display: paths.length > 0 && mode === "draw",
        },
        {
            icon: "lead-pencil",
            onPress: () => setMode("draw"),
            display: mode === "none",
        },
        {
            icon: "format-color-text",
            onPress: () => setTextMode(),
            display: mode === "none" && text.length === 0,
        },
    ];

    const leftCameraButtons: CameraButtonProps[] = [
        {
            icon: "close",
            onPress: () => {
                onClose();
                setPaths([]);
                setCurrent(Skia.Path.Make());
            },
        },
    ];

    return (
        <View style={{ flex: 1 }}>
            <GestureDetector gesture={mode === "draw" ? drawing : tapGesture}>
                <Canvas style={{ flex: 1 }}>
                    {mediaPath.type == "photo" && (
                        <ImageArtboard path={mediaPath.path} />
                    )}
                    {mediaPath.type == "video" && (
                        <VideoArtboard path={mediaPath.path} paused={paused} />
                    )}

                    {paths.map(({ id, path, color }) => (
                        <Path
                            key={id}
                            path={path}
                            strokeWidth={5}
                            style="stroke"
                            color={color}
                        />
                    ))}
                    {current && (
                        <Path
                            path={current}
                            strokeWidth={5}
                            style="stroke"
                            color={Colors.purple}
                        />
                    )}
                </Canvas>
            </GestureDetector>

            <CameraButtonGroup
                buttons={leftCameraButtons}
                style={styles.leftButtonRow}
            />

            <CameraButtonGroup
                buttons={rightCameraButtons}
                style={styles.rightButtonRow}
            />

            {mode === "text" && (
                <Pressable
                    onPress={() => {
                        Keyboard.dismiss();
                        setMode("none");
                    }}
                    style={styles.overlay}
                />
            )}

            <TextInput
                ref={inputRef}
                style={[
                    styles.textInput,
                    {
                        minHeight: Math.max(minInputHeight, 18) + 20,
                        opacity: mode === "text" || text.length > 0 ? 1 : 0,
                        bottom:
                            minInputHeight +
                            SAFE_AREA_PADDING.paddingBottom +
                            300,
                    },
                ]}
                multiline={true}
                value={text}
                onChangeText={setText}
                onFocus={() => {
                    setMode("text");
                }}
                onContentSizeChange={(e) => {
                    setMinInputHeight(e.nativeEvent.contentSize.height);
                }}
                onBlur={() => setMode("none")}
                blurOnSubmit={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
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

    textInput: {
        position: "absolute",
        bottom: SAFE_AREA_PADDING.paddingBottom + 300,
        left: 0,
        right: 0,
        textAlign: "center",
        textAlignVertical: "center",
        height: 40,
        paddingHorizontal: 10,
        paddingVertical: 8,
        color: "white",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },

    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
});
