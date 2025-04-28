import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import {
    Camera,
    useCameraDevice,
    useCodeScanner,
} from "react-native-vision-camera";
import { generateQrCode } from "react-native-qr";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

import { DIDDocument } from "@smashchats/library";

import { ThemedText } from "@/src/ui/components/ThemedText";
import { useGlobalState } from "@/src/context/GlobalContext";
import { INSETS, SCREEN_HEIGHT, SCREEN_WIDTH } from "@/src/ui/constants";
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

    const [mode, setMode] = useState<"scan" | "show">("scan");
    const [code, setCode] = useState<string | undefined>(undefined);
    const [flash, setFlash] = useState<boolean>(false);
    const [qrCode, setQrCode] = useState<string | undefined>(undefined);
    const [qrCodeLoaded, setQrCodeLoaded] = useState(false);

    const qrOpacity = useSharedValue(0);
    const qrScale = useSharedValue(0.8);
    const targetOpacity = useSharedValue(1);

    const generateQrCodeWithDid = async (did: DIDDocument) => {
        try {
            const img = await generateQrCode(JSON.stringify(did), 300);
            if (img) {
                Image.prefetch(img);
                setQrCode(img);
            }
        } catch (error) {
            console.error("Error generating QR code:", error);
        }
    };

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
            await generateQrCodeWithDid(await user.getDIDDocument());
        })();
    }, [globalState.selfSmashUser]);

    useEffect(() => {
        if (mode === "scan") {
            targetOpacity.value = withTiming(1, { duration: 300 });
            qrOpacity.value = withTiming(0, { duration: 200 });
            qrScale.value = withTiming(0.8, { duration: 200 });
        } else {
            targetOpacity.value = withTiming(0, { duration: 200 });
            if (qrCodeLoaded) {
                qrOpacity.value = withTiming(1, { duration: 300 });
                qrScale.value = withTiming(1, { duration: 400 });
            }
        }
    }, [mode, qrOpacity, qrScale, targetOpacity, qrCodeLoaded]);

    const animatedQrStyle = useAnimatedStyle(() => {
        return {
            opacity: qrOpacity.value,
            transform: [{ scale: qrScale.value }],
            position: "absolute",
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_WIDTH * 0.9,
            top: 180,
            left: SCREEN_WIDTH / 2 - SCREEN_WIDTH * 0.45,
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
    }, [code, router]);

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

    const handleImageLoad = () => {
        setQrCodeLoaded(true);
        if (mode === "show") {
            qrOpacity.value = withTiming(1, { duration: 300 });
            qrScale.value = withTiming(1, { duration: 400 });
        }
    };

    return (
        <View
            style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: Colors.background },
            ]}
        >
            {mode === "scan" && (
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
            )}

            <Animated.View style={animatedQrStyle}>
                <Image
                    cachePolicy="memory-disk"
                    source={{ uri: qrCode }}
                    contentFit="contain"
                    style={{ width: "100%", height: "100%" }}
                    onLoad={handleImageLoad}
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
                        bottom: INSETS.safeAreaInsetsBottom,
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
                        top: INSETS.safeAreaInsetsTop + 70 + SCREEN_HEIGHT / 2,
                        height: 70,
                        left: 30,
                        right: 30,
                        bottom: INSETS.safeAreaInsetsBottom,
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
                        top: INSETS.safeAreaInsetsTop + 10,
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

            <View style={[styles.floatingRow, styles.container]}>
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
        bottom: INSETS.safeAreaInsetsBottom + 10,
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
