import React, { useEffect, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import {
    useCameraPermission,
    useMicrophonePermission,
    Camera,
} from "react-native-vision-camera";
import { useRouter } from "expo-router";

import {
    EncapsulatedIMProtoMessage,
    DIDString,
    IM_CHAT_TEXT,
    IMProtoMessage,
} from "@smashchats/library";

import { Colors } from "@/src/constants/Colors.js";
import { ChatList } from "@/src/ui/fragments/ChatList";
import { FloatingActionButton } from "@/src/ui/design-system/FloatingActionButton";
import {
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext.js";
import { ChatListView } from "@/src/types/ChatListScreen.types";
import { useLiveTablesQuery } from "@/src/hooks/useLiveQuery";
import { chatListView } from "@/src/db/queries/ChatListView";

export function Home() {
    const dispatch = useGlobalDispatch();
    const { logger, selfSmashUser } = useGlobalState();
    const router = useRouter();
    const {
        hasPermission: hasCameraPermission,
        requestPermission: requestCameraPermission,
    } = useCameraPermission();
    const {
        hasPermission: hasMicrophonePermission,
        requestPermission: requestMicrophonePermission,
    } = useMicrophonePermission();
    const [chats, setChats] = useState<ChatListView[]>([]);

    const user = selfSmashUser;
    useEffect(() => {
        if (user) {
            const listener = async (
                senderDid: DIDString,
                originalMessage: IMProtoMessage
            ) => {
                const message = originalMessage as EncapsulatedIMProtoMessage; // TODO remove "as" when lib exports proper types
                dispatch({
                    type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION",
                    discussionId: senderDid,
                    messageId: message.sha256,
                });
            };

            user.on(IM_CHAT_TEXT, listener);

            return () => {
                user.removeListener("data", listener);
            };
        }
    }, [user]);

    const { data: chat_list_data } = useLiveTablesQuery(chatListView, [
        "messages",
        "contacts",
        "trust_relations",
    ]);

    useEffect(() => {
        setChats(
            chat_list_data.map((d) => ({
                ...d,
                most_recent_message: d.most_recent_message ?? "",
                most_recent_message_type: d.most_recent_message_type ?? "empty",
                most_recent_message_date: d.most_recent_message_date
                    ? d.most_recent_message_date * 1000
                    : d.created_at.getTime(),
                trusted_name: d.trusted_name ?? undefined,
            }))
        );
    }, [chat_list_data]);

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
            logger.error(error as string);
        }
    }

    return (
        <SafeAreaView
            style={{ backgroundColor: Colors.background, minHeight: "100%" }}
        >
            <ChatList chats={chats} />
            <FloatingActionButton
                icon="camera"
                onPress={handleFABCameraPress}
            />
        </SafeAreaView>
    );
}

export default Home;
