import * as React from "react";
import { useState } from "react";
import { View, StyleSheet } from "react-native";

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

    console.log("rotation", rotation);

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

    const paused = useSharedValue(false);
    //#endregion

    const rightCameraButtons: CameraButtonProps[] = [
        {
            icon: "undo",
            onPress: () => {
                setPaths(paths.slice(0, -1));
            },
            display: paths.length > 0,
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
            <GestureDetector gesture={drawing}>
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
});
