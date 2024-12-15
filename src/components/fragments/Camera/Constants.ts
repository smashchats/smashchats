import { Dimensions, Platform } from "react-native";
import { initialWindowMetrics } from "react-native-safe-area-context";
import StaticSafeAreaInsets from "react-native-static-safe-area-insets";

export const CONTENT_SPACING = 15;

const SAFE_BOTTOM =
    Platform.select({
        ios: StaticSafeAreaInsets.safeAreaInsetsBottom,
    }) ?? 0;

export const SAFE_AREA_PADDING = {
    paddingLeft: StaticSafeAreaInsets.safeAreaInsetsLeft + CONTENT_SPACING,
    paddingTop: Math.max(StaticSafeAreaInsets.safeAreaInsetsTop, initialWindowMetrics?.insets?.top ?? 0) + CONTENT_SPACING, // https://github.com/th3rdwave/react-native-safe-area-context/issues/124#issuecomment-1018323396
    paddingRight: StaticSafeAreaInsets.safeAreaInsetsRight + CONTENT_SPACING,
    paddingBottom: SAFE_BOTTOM + CONTENT_SPACING,
};

// The maximum zoom _factor_ you should be able to zoom in
export const MAX_ZOOM_FACTOR = 10;

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Platform.select<number>({
    android:
        Dimensions.get("screen").height -
        StaticSafeAreaInsets.safeAreaInsetsBottom,
    ios: Dimensions.get("window").height,
}) as number;

// Capture Button
export const CAPTURE_BUTTON_SIZE = 78;

// Control Button like Flash
export const CONTROL_BUTTON_SIZE = 40;
