import React from "react";
import { Platform, StyleProp, StyleSheet, ViewStyle } from "react-native";

import StaticSafeAreaInsets from "react-native-static-safe-area-insets";
import { initialWindowMetrics } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const FALLBACK_COLOR = "rgba(140, 140, 140, 0.3)";

const StatusBarBlurBackgroundImpl = ({
    style,
    ...props
}: {
    style?: StyleProp<ViewStyle>;
}): React.ReactElement | null => {
    if (Platform.OS !== "ios") return null;

    return (
        <BlurView
            style={[styles.statusBarBackground, style]}
            intensity={25}
            blurReductionFactor={4}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            {...props}
        />
    );
};

export const StatusBarBlurBackground = React.memo(StatusBarBlurBackgroundImpl);

const styles = StyleSheet.create({
    statusBarBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: Math.max(
            StaticSafeAreaInsets.safeAreaInsetsTop,
            initialWindowMetrics?.insets?.top ?? 0
        ),
        backgroundColor: FALLBACK_COLOR,
    },
});
