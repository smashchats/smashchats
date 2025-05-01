import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";

import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import {
    Camera,
    useCameraDevice,
    useCodeScanner,
} from "react-native-vision-camera";
import QRCode from "react-qr-code";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DIDDocument } from "@smashchats/library";

import { ThemedText } from "@/src/ui/components/ThemedText";
import { useGlobalState } from "@/src/context/GlobalContext";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/src/ui/constants";
import { BareBackButton } from "@/src/ui/fragments/BackButton";
import { saveContactToDb } from "@/src/db/models/Contacts";
import { MapDidToContactInsert } from "@/src/utils/mappers/contacts";
import { DIDDocumentSchema } from "@/src/utils/schemas/didSchema";
import { IconButton } from "@/src/ui/components/IconButton";
import { Colors } from "@/src/constants/Colors";
import { TabBar } from "@/src/ui/fragments/TabBar";

export default function CodeScanner() {
    const globalState = useGlobalState();
    const device = useCameraDevice("back");
    const cameraRef = useRef<Camera>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [mode, setMode] = useState<"scan" | "show">("scan");
    const [code, setCode] = useState<string | undefined>(undefined);
    const [flash, setFlash] = useState<boolean>(false);
    const [qrCode, setQrCode] = useState<string | undefined>(undefined);

    const qrOpacity = useSharedValue(0);
    const qrScale = useSharedValue(0.8);
    const targetOpacity = useSharedValue(1);

    useEffect(() => {
        ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
    }, []);

    useEffect(() => {
        (async () => {
            const user = globalState.selfSmashUser;
            if (!user) {
                return;
            }
            setQrCode(JSON.stringify(await user.getDIDDocument()));
        })();
    }, [globalState.selfSmashUser]);

    useEffect(() => {
        if (mode === "scan") {
            targetOpacity.value = withTiming(1, { duration: 300 });
            qrOpacity.value = withTiming(0, { duration: 200 });
            qrScale.value = withTiming(0.8, { duration: 200 });
        } else {
            targetOpacity.value = withTiming(0, { duration: 200 });
            qrOpacity.value = withTiming(1, { duration: 300 });
            qrScale.value = withTiming(1, { duration: 400 });
            setFlash(false);
        }
    }, [mode, qrOpacity, qrScale, targetOpacity]);

    const animatedQrStyle = useAnimatedStyle(() => {
        return {
            opacity: qrOpacity.value,
            transform: [{ scale: qrScale.value }],
            position: "absolute",
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_WIDTH * 0.9,
            top: 180,
            left: SCREEN_WIDTH / 2 - SCREEN_WIDTH * 0.45,
            backgroundColor: "white",
            padding: SCREEN_WIDTH * 0.05,
            borderRadius: 16,
        };
    });

    const animatedScannerStyle = useAnimatedStyle(() => {
        return {
            opacity: targetOpacity.value,
            ...StyleSheet.absoluteFillObject,
        };
    });

    const animatedTargetStyle = useAnimatedStyle(() => {
        return {
            opacity: targetOpacity.value,
            position: "absolute",
            width: SCREEN_WIDTH * 0.8,
            height: SCREEN_WIDTH * 0.8,
        };
    });

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned: (codes) => {
            console.debug(codes);
            if (code === undefined) {
                setCode(codes[0].value);
            }
        },
    });

    const handleCodeScanned = async (code: string) => {
        let did: DIDDocument;
        try {
            did = DIDDocumentSchema.parse(code) as DIDDocument;
        } catch (error) {
            console.debug(error);
            Alert.alert("The ID you scanned is not valid");
            throw error;
        }
        try {
            await saveContactToDb(MapDidToContactInsert(did));
            router.replace(`/profile/${did.id}/messages`);
        } catch (error) {
            console.debug(error);
            Alert.alert("Failed to save contact");
        }
    };

    useEffect(() => {
        if (code) {
            handleCodeScanned(code);
        }
    }, [code]);

    if (!device) {
        return null;
    }

    const focusCamera = () => {
        cameraRef.current?.focus({
            x: SCREEN_WIDTH / 2,
            y: SCREEN_HEIGHT / 2,
        });
    };

    const toggleFlash = () => {
        setFlash(!flash);
    };

    return (
        <View
            style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: Colors.background },
            ]}
        >
            <Animated.View style={animatedScannerStyle}>
                <Pressable
                    style={{
                        flex: 1,
                    }}
                    onPress={focusCamera}
                >
                    <Camera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        codeScanner={codeScanner}
                        isActive={true}
                        torch={flash ? "on" : "off"}
                    />
                </Pressable>
            </Animated.View>

            <Animated.View style={animatedQrStyle}>
                <QRCode
                    size={SCREEN_WIDTH * 0.8}
                    value={qrCode ?? ""}
                    fgColor={Colors.purple}
                />
            </Animated.View>

            <Animated.View style={animatedTargetStyle}>
                <Pressable
                    style={[
                        styles.centeredFloating,
                        {
                            borderRadius: 32,
                            borderWidth: 3,
                            borderColor: "white",
                        },
                    ]}
                    onPress={focusCamera}
                />
            </Animated.View>

            {mode === "show" && (
                <View
                    style={{
                        position: "absolute",
                        top: (SCREEN_HEIGHT / 2) * 0.8,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ThemedText
                        style={{
                            width: SCREEN_WIDTH / 2,
                            color: "white",
                            textAlign: "center",
                            fontSize: 18,
                        }}
                    >
                        Scan to get added to SmashChats
                    </ThemedText>
                </View>
            )}

            {mode === "scan" && (
                <View
                    style={{
                        position: "absolute",
                        top:
                            insets.top +
                            (SCREEN_HEIGHT - 2 * insets.top) / 2 +
                            140,
                        height: 70,
                        left: 30,
                        right: 30,
                        bottom: insets.bottom,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "black",
                        borderRadius: 16,
                        overflow: "hidden",
                    }}
                >
                    <ThemedText
                        type="subtitle"
                        style={{
                            color: "white",
                            textAlign: "center",
                            marginBottom: 0,
                            padding: 16,
                            borderRadius: 500,
                        }}
                    >
                        Scan code to add contact
                    </ThemedText>
                </View>
            )}

            <View
                style={[
                    styles.floatingRow,
                    {
                        top: insets.top + 10,
                        justifyContent: "space-between",
                        width: "100%",
                        paddingHorizontal: 10,
                    },
                ]}
            >
                <BareBackButton />
                {mode === "scan" && (
                    <IconButton
                        icon={flash ? "flash" : "flash-off"}
                        onPress={toggleFlash}
                    />
                )}
            </View>

            <View
                style={[
                    styles.floatingRow,
                    styles.container,
                    { bottom: insets.bottom + 10 },
                ]}
            >
                <TabBar
                    active={mode}
                    buttons={[
                        {
                            label: "Add contact",
                            id: "scan",
                            onPress: () => setMode("scan"),
                        },
                        {
                            label: "My code",
                            id: "show",
                            onPress: () => setMode("show"),
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    floatingRow: {
        position: "absolute",
        flexDirection: "row",
    },
    container: {
        left: 0,
        right: 0,
        justifyContent: "center",
    },
    centeredFloating: {
        position: "absolute",
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 0.8,
        top: 200,
        left: SCREEN_WIDTH / 2 - SCREEN_WIDTH * 0.4,
    },
});
