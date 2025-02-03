import { Platform } from "react-native";
import { initialWindowMetrics } from "react-native-safe-area-context";
import StaticSafeAreaInsets from "react-native-static-safe-area-insets";

export const CONTENT_SPACING = 15;

const SAFE_BOTTOM =
    Platform.select({
        ios: StaticSafeAreaInsets.safeAreaInsetsBottom,
    }) ?? 0;

export const SAFE_AREA_PADDING = {
    paddingTop: Math.max(
        Math.max(
            StaticSafeAreaInsets.safeAreaInsetsTop,
            initialWindowMetrics?.insets?.top ?? 0 // https://github.com/AppAndFlow/react-native-safe-area-context/issues/124#issuecomment-1018323396
        ),
        CONTENT_SPACING
    ),
    paddingBottom: Math.max(SAFE_BOTTOM, CONTENT_SPACING),
    paddingLeft: StaticSafeAreaInsets.safeAreaInsetsLeft + CONTENT_SPACING,
    paddingRight: StaticSafeAreaInsets.safeAreaInsetsRight + CONTENT_SPACING,
};

// The maximum zoom _factor_ you should be able to zoom in
export const MAX_ZOOM_FACTOR = 10;

// Capture Button
export const CAPTURE_BUTTON_SIZE = 78;

// Control Button like Flash
export const CONTROL_BUTTON_SIZE = 40;
