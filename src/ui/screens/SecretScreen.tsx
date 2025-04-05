import React, { Dispatch, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Button,
} from "react-native";

import { generateQrCode } from "react-native-qr";
import * as Updates from "expo-updates";
import { DIDDocument } from "@smashchats/library";

import {
    Action,
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext";
import { SheetManager } from "react-native-actions-sheet";
import { generateNewIdentity, loadIdentity } from "@/src/utils/IdentityUtils";
import { IDENTITY_KEY, saveObject } from "@/src/utils/StorageUtils";
import { getDIDManager } from "@/src/utils/DIDManagerSingleton";

const SecretScreen = () => {
    const globalState = useGlobalState();
    const globalDispatch = useGlobalDispatch();

    const [qrCode, setQrCode] = useState<string | undefined>(undefined);

    const generateQrCodeWithDid = async (did: DIDDocument) => {
        generateQrCode(JSON.stringify(did), 300).then(
            (img: string | undefined) => {
                if (!img) {
                    return;
                }
                setQrCode(img);
            }
        );
    };

    const refreshDid = async () => {
        const user = globalState.selfSmashUser;
        if (!user) {
            return;
        }
        globalDispatch({
            type: "SET_SELF_DID_ACTION",
            selfDid: await user.getDIDDocument(),
        });
        generateQrCodeWithDid(await user.getDIDDocument());
    };

    async function onFetchUpdateAsync() {
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
        generateQrCodeWithDid(globalState.selfDid);
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
            generateQrCodeWithDid(await user.getDIDDocument());
            setInterval(async () => {
                console.log(await user.getDIDDocument());
            }, 1000);
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

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={true}
        >
            <Text style={styles.title}>Secret Development Screen</Text>
            <Text style={styles.textTitle}>identity actions</Text>
            <Button
                title="generate new identity"
                onPress={onGenerateNewIdentity}
            />
            <Button title="refresh did" onPress={refreshDid} />
            <View style={styles.qrContainer}>
                <Image
                    style={{
                        width: 300,
                        height: 300,
                        display: "flex",
                    }}
                    source={{ uri: qrCode }}
                />
            </View>
            <Text style={styles.textTitle}>did</Text>
            <Text selectable style={styles.textContent}>
                {JSON.stringify(globalState.selfDid)}
            </Text>

            <Text style={styles.textTitle}>Updates</Text>
            <Button title="check for update" onPress={onFetchUpdateAsync} />
            <Text style={styles.textTitle}>manifest</Text>
            <Text selectable style={styles.textContent}>
                {JSON.stringify(Updates.manifest)}
            </Text>
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
