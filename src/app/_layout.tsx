import "@/src/polyfills";
import "react-native-get-random-values";

// ================================
import { useEffect } from "react";
import { View } from "react-native";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import PolyfillCrypto from "react-native-webview-crypto";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SheetProvider } from "react-native-actions-sheet";
// ================================
import "@/src/app/sheets";
import { SmashMessaging } from "@smashchats/library";

import { GlobalProvider } from "@/src/context/GlobalContext.js";
import { useColorScheme } from "@/src/hooks/useColorScheme.js";

import LoaderScreen from "@/src/app/loader";
import { ThemedText } from "@/src/ui/components/ThemedText";
import { Colors } from "@/src/constants/Colors";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
    const colorScheme = useColorScheme();
    const [fontsLoaded] = useFonts({
        SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    });

    let success = false;
    let error: Error | undefined = undefined;

    SmashMessaging.setCrypto(window.crypto);

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    if (error && !success) {
        SplashScreen.hideAsync();
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ThemedText>
                    {__DEV__ ? error ?? "Unknown error" : "Unknown error"}
                </ThemedText>
            </View>
        );
    }
    if (!fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView
            style={{ flex: 1, backgroundColor: Colors.background }}
        >
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <PolyfillCrypto
                    // @ts-ignore
                    debug={false}
                />
                <GlobalProvider>
                    <SheetProvider>
                        <LoaderScreen />
                    </SheetProvider>
                </GlobalProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

const show_storybook = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";

if (show_storybook) {
    SplashScreen.hideAsync();
}

const AppEntryPoint = show_storybook
    ? require("@/.storybook").default
    : RootLayout;

export default AppEntryPoint;
