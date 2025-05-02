import { Dimensions, Platform } from "react-native";
import StaticSafeAreaInsets from "react-native-static-safe-area-insets";

export const SCREEN_WIDTH = Dimensions.get("window").width;

let safeAreaInsetsBottom = 0;
if (Platform.OS === "android") {
    StaticSafeAreaInsets.getSafeAreaInsets((insets) => {
        safeAreaInsetsBottom = insets.safeAreaInsetsBottom;
    });
}

export const SCREEN_HEIGHT = Platform.select<number>({
    android: Dimensions.get("window").height - safeAreaInsetsBottom,
    ios: Dimensions.get("window").height,
}) as number;
