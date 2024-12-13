import React, { useEffect } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import {
    useCameraPermission,
    useMicrophonePermission,
    Camera,
} from "react-native-vision-camera";
import { EncapsulatedSmashMessage, SmashDID } from "smash-node-lib";

import { Colors } from "@/src/constants/Colors.js";
import { ChatList } from "@/src/components/fragments/ChatList/ChatList.jsx";
import { FloatingActionButton } from "@/src/components/design-system/FloatingActionButton.jsx";
import {
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext.js";
import { getEnrichedMessage } from "@/src/IdentityUtils";

export function Home() {
    const dispatch = useGlobalDispatch();
    const globalState = useGlobalState();
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
            // TODO: do not listen to this, only for testing
            const listener = async (
                message: EncapsulatedSmashMessage,
                senderDid: SmashDID
            ) => {
                const m = getEnrichedMessage(message, senderDid);
                dispatch({
                    type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION",
                    discussionId: senderDid.id,
                    messageId: m.sha256,
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

            if (cameraPermissionStatus === "denied") {
                alert(
                    "You need to grant camera permission to use this feature. Please go to settings and grant permission."
                );
            }
            if (microphonePermissionStatus === "denied") {
                alert(
                    "You need to grant microphone permission to use this feature. Please go to settings and grant permission."
                );
            }
        } catch (error) {
            console.error(error);
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
