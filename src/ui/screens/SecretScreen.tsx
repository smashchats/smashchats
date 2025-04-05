import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

import { generateQrCode } from "react-native-qr";
import * as Updates from "expo-updates";

import { useGlobalState } from "@/src/context/GlobalContext";

const SecretScreen = () => {
    const globalState = useGlobalState();

    const [qrCode, setQrCode] = useState<string | undefined>(undefined);

    const generateQrCodeWithDid = async () => {
        generateQrCode(JSON.stringify(globalState.selfDid), 300).then(
            (img: string | undefined) => {
                if (!img) {
                    return;
                }
                setQrCode(img);
            }
        );
    };

    async function onFetchUpdateAsync() {
        try {
            console.log("Updates.manifest", Updates.manifest);
        } catch (error) {
            // You can also add an alert() to see the error message in case of an error when fetching updates.
            alert(`Error fetching latest Expo update: ${error}`);
        }
    }

    useEffect(() => {
        generateQrCodeWithDid();
        onFetchUpdateAsync();
    }, []);

    return (
        <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={true}
        >
            <Text style={styles.title}>Secret Development Screen</Text>
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
            <Text selectable style={styles.textContent}>{JSON.stringify(globalState.selfDid)}</Text>

            <Text style={styles.textTitle}>update manifest</Text>
            <Text style={styles.textContent}>{JSON.stringify(Updates.manifest)}</Text>
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
