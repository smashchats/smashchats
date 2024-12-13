import { useEffect } from "react";
import { View } from "react-native";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";

import { SmashUser } from "@smashchats/library";

import { handleUserMessages, loadIdentity } from "@/src/IdentityUtils";
import {
    DEFAULT_SETTINGS,
    Settings,
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext";
import { getData, saveData } from "@/src/StorageUtils";
import { ThemedText } from "@/src/components/ThemedText";
import { dev_nab_join_action } from "@/src/data/dev";
import { createTrustRelation } from "@/src/models/TrustRelation";

export default function LoaderScreen() {
    const dispatch = useGlobalDispatch();
    const state = useGlobalState();

    const initializeUserAndDiscoverNetwork = async (user: SmashUser) => {
        try {
            await Promise.all([
                createTrustRelation(dev_nab_join_action.did.id),
                user.join(dev_nab_join_action),
                new Promise((resolve) => setTimeout(() => resolve, 1000)),
            ]);
            await user.discover();
        } catch (error) {
            console.error("Error creating trust relation", error);
        }
    };

    useEffect(() => {
        dispatch({
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: "LOADING",
        });

        (async () => {
            const [settings] = await Promise.all([
                getData<Settings>("settings.settings"),
            ]);
            if (settings !== null) {
                SplashScreen.hideAsync();

                dispatch({
                    type: "SET_SETTINGS_ACTION",
                    settings: settings,
                });
                dispatch({
                    type: "SET_APP_WORKFLOW_ACTION",
                    appWorkflow: "CONNECTING",
                });
                const user = await loadIdentity("WARN");
                dispatch({
                    type: "SET_USER_ACTION",
                    user,
                });
                handleUserMessages(user);
                await initializeUserAndDiscoverNetwork(user);
                dispatch({
                    type: "SET_APP_WORKFLOW_ACTION",
                    appWorkflow: "CONNECTED",
                });
            } else {
                saveData<Settings>("settings.settings", DEFAULT_SETTINGS);
                dispatch({
                    type: "SET_APP_WORKFLOW_ACTION",
                    appWorkflow: "REGISTERING",
                });
                SplashScreen.hideAsync();
                const user = await loadIdentity("WARN");
                dispatch({
                    type: "SET_APP_WORKFLOW_ACTION",
                    appWorkflow: "REGISTERED",
                });
                dispatch({
                    type: "SET_USER_ACTION",
                    user,
                });
                handleUserMessages(user);
                await initializeUserAndDiscoverNetwork(user);
                dispatch({
                    type: "SET_APP_WORKFLOW_ACTION",
                    appWorkflow: "CONNECTED",
                });
            }
        })();
    }, []);

    useEffect(() => {
        console.debug(state.appWorkflow);
    }, [state.appWorkflow]);

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
                            name="profile/[user]/(tabs)"
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="settings"
                            options={{ title: "Settings" }}
                        />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                </PostHogProvider>
            )}
        </>
    );
}
