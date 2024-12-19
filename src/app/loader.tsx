import { Dispatch, useEffect } from "react";
import { View } from "react-native";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";

import { SmashProfileMeta, SmashUser } from "@smashchats/library";

import { handleUserMessages, loadIdentity } from "@/src/IdentityUtils";
import {
    Action,
    Settings,
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext";
import { getData } from "@/src/StorageUtils";
import { ThemedText } from "@/src/components/ThemedText";
import { dev_nab_join_action } from "@/data/dev";
import { createTrustRelation } from "@/src/models/TrustRelation";

export default function LoaderScreen() {
    const dispatch = useGlobalDispatch();
    const state = useGlobalState();

    const initializeUserAndDiscoverNetwork = async (user: SmashUser) => {
        try {
            await Promise.all([
                createTrustRelation(dev_nab_join_action.did.id),
                user.join(dev_nab_join_action),
            ]);
            await user.discover();
        } catch (error) {
            console.error("Error creating trust relation", error);
        }
    };

    const initializeApp = async (
        dispatch: Dispatch<Action>,
        newUser: boolean
    ) => {
        await SplashScreen.hideAsync();

        if (newUser) {
            await handleNewUser(dispatch);
        } else {
            await handleExistingUser(dispatch);
        }
    };

    const handleNewUser = async (dispatch: Dispatch<Action>) => {
        dispatch({
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: "REGISTERING",
        });

        const user = await setupUser(dispatch);
        dispatch({
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: "REGISTERED",
        });

        await finalizeSetup(dispatch, user);
    };

    const handleExistingUser = async (dispatch: Dispatch<Action>) => {
        dispatch({
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: "CONNECTING",
        });

        const user = await setupUser(dispatch);
        await finalizeSetup(dispatch, user);
    };

    const setupUser = async (dispatch: Dispatch<Action>) => {
        const user = await loadIdentity(__DEV__ ? "DEBUG" : "WARN");
        dispatch({
            type: "SET_USER_ACTION",
            user,
        });
        dispatch({
            type: "SET_SELF_DID_ACTION",
            selfDid: await user.getDID(),
        });
        return user;
    };

    const finalizeSetup = async (
        dispatch: Dispatch<Action>,
        user: SmashUser
    ) => {
        handleUserMessages(user);
        await initializeUserAndDiscoverNetwork(user);
        dispatch({
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: "CONNECTED",
        });
    };

    useEffect(() => {
        dispatch({
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: "LOADING",
        });

        (async () => {
            const [settings, meta] = await Promise.all([
                getData<Settings>("settings.settings"),
                getData<SmashProfileMeta>("settings.user_meta"),
            ]);
            const newUser = settings === null;
            dispatch({
                type: "SET_SETTINGS_ACTION",
                settings,
            });
            dispatch({
                type: "SET_SETTINGS_USER_META_ACTION",
                userMeta: meta,
            });
            await initializeApp(dispatch, newUser);
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
                            name="profile/[user]/(tabs)"
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="settings"
                            options={{ title: "Settings" }}
                        />

                        <Stack.Screen
                            name="camera"
                            options={{ title: "Camera" }}
                        />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                </PostHogProvider>
            )}
        </>
    );
}
