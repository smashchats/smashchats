import "@/src/polyfills";
// ================================
import { useEffect } from "react";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import PolyfillCrypto from "react-native-webview-crypto";

import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// ================================
import { SmashMessaging } from "@smashchats/library";

import migrations from "@/drizzle/migrations.js";
import { GlobalProvider } from "@/src/context/GlobalContext.js";
import { useColorScheme } from "@/src/hooks/useColorScheme.js";


import { drizzle_db, expo_db } from "@/src/db/database";
import LoaderScreen from "@/src/app/loader";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [fontsLoaded] = useFonts({
        SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    });

    if (__DEV__) {
        useDrizzleStudio(expo_db);
    }

    let success = false;
    let error: Error | undefined = undefined;

    const { success: _success, error: _error } = useMigrations(
        drizzle_db,
        migrations
    );
    success = _success;
    error = _error;

    useEffect(() => {
        if (fontsLoaded && success) {
            SmashMessaging.setCrypto(window.crypto);
        }
    }, [fontsLoaded, success]);

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <PolyfillCrypto
                    // @ts-ignore
                    debug={false}
                />
                <GlobalProvider>
                    <LoaderScreen />
                </GlobalProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
