import React, { Dispatch, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Button,
    Switch,
} from "react-native";

import QRCode from "react-qr-code";
import * as Updates from "expo-updates";

import {
    Action,
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext";
import { SheetManager } from "react-native-actions-sheet";
import { generateNewIdentity, loadIdentity } from "@/src/utils/IdentityUtils";
import { IDENTITY_KEY, saveObject } from "@/src/utils/StorageUtils";
import { getDIDManager } from "@/src/utils/DIDManagerSingleton";
import { Collapsible } from "../components/Collapsible";

const SecretScreen = () => {
    const globalState = useGlobalState();
    const globalDispatch = useGlobalDispatch();

    const [qrCode, setQrCode] = useState<string | undefined>(undefined);

    const refreshDid = async () => {
        const user = globalState.selfSmashUser;
        if (!user) {
            return;
        }
        globalDispatch({
            type: "SET_SELF_DID_ACTION",
            selfDid: await user.getDIDDocument(),
        });
        setQrCode(JSON.stringify(await user.getDIDDocument()));
    };

    async function onFetchUpdateAsync() {
        if (__DEV__) {
            return;
        }
        try {
            const update = await Updates.checkForUpdateAsync();
            globalState.logger.debug("update", update);

            if (update.isAvailable) {
                globalState.logger.debug("Fetching update");
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
            }
        } catch (error) {
            globalState.logger.error(
                "Error fetching latest Expo update",
                error
            );
            // You can also add an alert() to see the error message in case of an error when fetching updates.
            alert(`Error fetching latest Expo update: ${error}`);
        }
    }

    useEffect(() => {
        setQrCode(JSON.stringify(globalState.selfDid));
        onFetchUpdateAsync();
    }, []);

    async function onGenerateNewIdentity(): Promise<void> {
        const canDo: boolean = await SheetManager.show("confirm-sheet", {
            payload: {
                message: "Are you sure you want to generate a new identity?",
            },
        });
        if (canDo) {
            const newIdentity = await generateNewIdentity(getDIDManager());
            saveObject(IDENTITY_KEY, await newIdentity.serialize());
            const user = await setupUser(globalDispatch);
            setQrCode(JSON.stringify(await user.getDIDDocument()));
            console.log(await user.getDIDDocument());
        }
    }

    const setupUser = async (dispatch: Dispatch<Action>) => {
        const user = await loadIdentity(globalState.logger, "WARN");
        dispatch({
            type: "SET_USER_ACTION",
            user,
        });
        dispatch({
            type: "SET_SELF_DID_ACTION",
            selfDid: await user.getDIDDocument(),
        });
        return user;
    };

    const featureFlags = [
        {
            name: "enable-new-identity-generation",
            description: "Enable new identity generation",
        },
        {
            name: "media-allow-sending-voice-memos",
            description: "Allow sending voice memos",
        },
        {
            name: "media-allow-sending-images",
            description: "Allow sending images",
        },
        {
            name: "media-allow-sending-videos",
            description: "Allow sending videos",
        },
    ];

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={true}
        >
            <Text style={styles.title}>Secret Development Screen</Text>
            <Text style={styles.textTitle}>feature flags</Text>

            {featureFlags.map((flag) => {
                const enabled = globalState.featureFlags[flag.name];
                return (
                    <View
                        key={flag.name}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 10,
                            width: "100%",
                        }}
                    >
                        <Text style={styles.textContent}>
                            {flag.description}
                        </Text>
                        <Switch
                            style={{ marginLeft: 10 }}
                            value={enabled}
                            onValueChange={() => {
                                globalDispatch({
                                    type: "SET_FEATURE_FLAGS_ACTION",
                                    featureFlags: { [flag.name]: !enabled },
                                });
                            }}
                        />
                    </View>
                );
            })}
            <Collapsible title="installed feature flags">
                <Text style={styles.textContent}>
                    {JSON.stringify(globalState.featureFlags)}
                </Text>
            </Collapsible>

            <Text style={styles.textTitle}>identity actions</Text>
            <Button
                title="generate new identity"
                onPress={onGenerateNewIdentity}
            />
            <Button title="refresh did" onPress={refreshDid} />
            <View style={styles.qrContainer}>
                <QRCode value={qrCode ?? ""} size={300} />
            </View>
            <Text style={styles.textTitle}>did</Text>
            <Text selectable style={styles.textContent}>
                {JSON.stringify(globalState.selfDid)}
            </Text>

            {!__DEV__ && (
                <>
                    <Text style={styles.textTitle}>Updates</Text>
                    <Button
                        title="check for update"
                        onPress={onFetchUpdateAsync}
                    />
                    <Text style={styles.textTitle}>manifest</Text>
                    <Text selectable style={styles.textContent}>
                        {JSON.stringify(Updates.manifest)}
                    </Text>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        color: "#666",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
    },
    qrContainer: {
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        marginBottom: 20,
    },
    textTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 20,
        color: "#222",
    },
    textContent: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
});

export default SecretScreen;
