import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Button, Pressable, Dimensions } from "react-native";

import { Image } from "expo-image";

import ActionSheet, {
    SheetManager,
    SheetProps,
} from "react-native-actions-sheet";
import {
    Camera,
    useCameraDevice,
    useCodeScanner,
} from "react-native-vision-camera";
import { generateQrCode } from "react-native-qr";

import { DIDDocument } from "@smashchats/library";

import { ThemedText } from "@/src/ui/components/ThemedText";
import { useGlobalState } from "@/src/context/GlobalContext";

const CodeScannerSheet = (
    props: Readonly<SheetProps<"code-scanner-sheet">>
) => {
    const globalState = useGlobalState();
    const device = useCameraDevice("back");
    const cameraRef = useRef<Camera>(null);

    const [mode, setMode] = useState<"scan" | "show">("scan");
    const [code, setCode] = useState<string | undefined>(undefined);

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

    useEffect(() => {
        (async () => {
            const user = globalState.selfSmashUser;
            if (!user) {
                return;
            }
            await generateQrCodeWithDid(await user.getDIDDocument());
        })();
    }, [globalState.selfSmashUser]);

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned: (codes) => {
            console.debug(codes);
            if (code === undefined) {
                setCode(codes[0].value);
                handleConfirm(codes[0].value);
            }
        },
    });

    if (!device) {
        return null;
    }

    const handleCancel = () => {
        SheetManager.hide("code-scanner-sheet", {
            payload: undefined,
        });
    };

    const handleConfirm = (code: string | undefined) => {
        SheetManager.hide("code-scanner-sheet", {
            payload: code,
        });
    };

    const toggleMode = () => {
        setMode(mode === "scan" ? "show" : "scan");
    };

    return (
        <ActionSheet id={props.sheetId}>
            <View style={styles.container}>
                <ThemedText darkColor="black" type="subtitle">
                    {mode === "scan" ? "Add a new contact" : "My identity code"}
                </ThemedText>

                {mode === "scan" && (
                    <Pressable
                        style={{
                            flex: 1,
                        }}
                        onPress={() => {
                            cameraRef.current?.focus({ x: 150, y: 150 });
                        }}
                    >
                        <Camera
                            ref={cameraRef}
                            style={{
                                flex: 1,
                            }}
                            device={device}
                            codeScanner={codeScanner}
                            isActive={true}
                        />
                    </Pressable>
                )}

                {mode === "show" && (
                    <Image
                        source={{ uri: qrCode }}
                        contentFit="contain"
                        style={{
                            flex: 1,
                            width: "100%",
                        }}
                    />
                )}

                <View style={styles.buttonContainer}>
                    <Button
                        title="Cancel"
                        onPress={handleCancel}
                        testID="inputFieldSheetCancelButton"
                    />
                    <Button
                        title={mode === "scan" ? "Show my code" : "Scan again"}
                        onPress={toggleMode}
                        testID="inputFieldSheetConfirmButton"
                    />
                </View>
            </View>
        </ActionSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        minHeight: Dimensions.get("window").width + 100,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
    },
});

export default CodeScannerSheet;
