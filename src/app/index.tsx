import React, { useEffect } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import {
    useCameraPermission,
    useMicrophonePermission,
    Camera,
} from "react-native-vision-camera";
import { useRouter } from "expo-router";

import { EncapsulatedIMProtoMessage, DIDString } from "@smashchats/library";

import { Colors } from "@/src/constants/Colors.js";
import { ChatList } from "@/src/components/fragments/ChatList/ChatList.jsx";
import { FloatingActionButton } from "@/src/components/design-system/FloatingActionButton.jsx";
import {
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext.js";

export function Home() {
    const dispatch = useGlobalDispatch();
    const globalState = useGlobalState();
    const router = useRouter();
    const {
        hasPermission: hasCameraPermission,
        requestPermission: requestCameraPermission,
    } = useCameraPermission();
    const {
        hasPermission: hasMicrophonePermission,
        requestPermission: requestMicrophonePermission,
    } = useMicrophonePermission();

    const user = globalState.selfSmashUser;
    useEffect(() => {
        if (user) {
            const listener = async (
                message: EncapsulatedIMProtoMessage,
                senderDid: DIDString
            ) => {
                dispatch({
                    type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION",
                    discussionId: senderDid,
                    messageId: message.sha256,
                });
            };
            user.on("data", listener);

            return () => {
                user.removeListener("data", listener);
            };
        }
    }, [user]);

    async function handleFABCameraPress(): Promise<void> {
        try {
            let cameraPermissionStatus = Camera.getCameraPermissionStatus();
            let microphonePermissionStatus =
                Camera.getMicrophonePermissionStatus();

            if (
                !hasCameraPermission &&
                cameraPermissionStatus === "not-determined"
            ) {
                await requestCameraPermission();
            }
            if (
                !hasMicrophonePermission &&
                microphonePermissionStatus === "not-determined"
            ) {
                await requestMicrophonePermission();
            }

            cameraPermissionStatus = Camera.getCameraPermissionStatus();
            microphonePermissionStatus = Camera.getMicrophonePermissionStatus();

            let errors = 0;
            if (cameraPermissionStatus === "denied") {
                errors++;
                alert(
                    "You need to grant camera permission to use this feature. Please go to settings and grant permission."
                );
            }
            if (microphonePermissionStatus === "denied") {
                errors++;
                alert(
                    "You need to grant microphone permission to use this feature. Please go to settings and grant permission."
                );
            }

            if (errors > 0) {
                return;
            }

            return router.push("/camera");
        } catch (error) {
            globalState.logger.error(error as string);
        }
    }

    return (
        <SafeAreaView
            style={{ backgroundColor: Colors.background, minHeight: "100%" }}
        >
            <ChatList />
            {__DEV__ && (
                <FloatingActionButton
                    icon="camera"
                    onPress={handleFABCameraPress}
                />
            )}
        </SafeAreaView>
    );
}

export default Home;
