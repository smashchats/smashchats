import { useCallback, useEffect } from "react";
import { Platform, View } from "react-native";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import changeNavigationBarColor from "react-native-navigation-bar-color";

import { Logger, SmashUser, IMProfile } from "@smashchats/library";

import { loadIdentity } from "@/src/utils/IdentityUtils";
import { handleUserMessages } from "@/src/utils/messageHandlers";
import {
    Settings,
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext";
import {
    FEATURE_FLAGS_KEY,
    PROFILE_KEY,
    getData,
} from "@/src/utils/StorageUtils";
import { ThemedText } from "@/src/ui/components/ThemedText";
import { Colors } from "@/src/constants/Colors";

export default function LoaderScreen() {
    const dispatch = useGlobalDispatch();
    const state = useGlobalState();

    const setupUser = useCallback(async (): Promise<SmashUser> => {
        const user = await loadIdentity(state.logger, "WARN");
        dispatch({ type: "SET_USER_ACTION", user });
        const selfDid = await user.getDIDDocument();
        dispatch({ type: "SET_SELF_DID_ACTION", selfDid });
        return user;
    }, [dispatch, state.logger]);

    const initializeUserAndDiscoverNetwork = useCallback(
        async (user: SmashUser) => {
            try {
                state.logger.debug("Discovering network");
            } catch (error) {
                state.logger.error("Error creating trust relation", error);
            }
        },
        [state.logger]
    );

    const initializeApp = async (isNewUser: boolean) => {
        await SplashScreen.hideAsync();
        changeNavigationBarColor(Colors.background, false);

        dispatch({
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: isNewUser ? "REGISTERING" : "CONNECTING",
        });

        const user = await setupUser();

        if (isNewUser) {
            dispatch({
                type: "SET_APP_WORKFLOW_ACTION",
                appWorkflow: "REGISTERED",
            });
        }

        await handleUserMessages(user, state.logger);
        await initializeUserAndDiscoverNetwork(user);

        dispatch({
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: "CONNECTED",
        });
    };

    useEffect(() => {
        dispatch({ type: "SET_APP_WORKFLOW_ACTION", appWorkflow: "LOADING" });

        (async () => {
            const [settings, meta, featureFlags] = await Promise.all([
                getData<Settings>("settings.settings"),
                getData<Partial<IMProfile>>(PROFILE_KEY),
                getData<Record<string, boolean>>(FEATURE_FLAGS_KEY),
            ]);

            dispatch({ type: "SET_SETTINGS_ACTION", settings });
            dispatch({ type: "SET_SETTINGS_USER_META_ACTION", userMeta: meta });
            dispatch({
                type: "SET_FEATURE_FLAGS_ACTION",
                featureFlags: featureFlags ?? {},
            });
            dispatch({
                type: "SET_LOGGER_ACTION",
                logger: new Logger(meta?.title ?? "device", "DEBUG"),
            });

            await initializeApp(settings === null);
        })();
    }, []);

    return (
        <>
            {state.appWorkflow === "LOADING" && (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ThemedText>Loading...</ThemedText>
                </View>
            )}
            {["REGISTERING", "REGISTERED", "CONNECTING", "CONNECTED"].includes(
                state.appWorkflow
            ) && (
                <PostHogProvider
                    apiKey={
                        __DEV__ || !state.settings.telemetryEnabled
                            ? "unused so it's cheaper"
                            : "phc_jv4EKZkhXDRwWi0hrQg3YZ6ZdvKQZs7zxskqi9kvhWF"
                    }
                    options={{
                        host: "https://eu.i.posthog.com",
                    }}
                >
                    <Stack
                        initialRouteName={"index"}
                        screenOptions={{
                            headerTitleAlign: "center",
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen
                            name="index"
                            options={{
                                headerShown: false,
                                headerTitle: "Chats",
                            }}
                        />

                        <Stack.Screen
                            name="gallery"
                            options={{
                                title: "Gallery",
                                headerShown: false,
                                animation: "fade",
                                gestureEnabled: false,
                            }}
                        />

                        <Stack.Screen
                            name="profile/[user]/(tabs)"
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="settings"
                            options={{ title: "Settings" }}
                        />

                        {Platform.OS !== "web" && (
                            <Stack.Screen
                                name="camera"
                                options={{ title: "Camera" }}
                            />
                        )}

                        {Platform.OS !== "web" && (
                            <Stack.Screen
                                name="code-scanner"
                                options={{ headerShown: false }}
                            />
                        )}

                        <Stack.Screen
                            name="licenses"
                            options={{ title: "Licenses", headerShown: true }}
                        />

                        <Stack.Screen
                            name="secret"
                            options={{
                                title: "Secret",
                                headerShown: true,
                            }}
                        />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                </PostHogProvider>
            )}
        </>
    );
}
