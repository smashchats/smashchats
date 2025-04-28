import React, { useEffect, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Colors } from "@/src/constants/Colors.js";
import { ChatList } from "@/src/ui/fragments/ChatList";
import { FloatingActionButton } from "@/src/ui/design-system/FloatingActionButton";
import { useGlobalState } from "@/src/context/GlobalContext.js";
import { ChatListView } from "@/src/types/ChatListScreen.types";
import { useLiveTablesQuery } from "@/src/hooks/useLiveQuery";
import { chatListView } from "@/src/db/queries/ChatListView";
import usePermission from "@/src/hooks/usePermission";

export function Home() {
    const { logger } = useGlobalState();
    const router = useRouter();
    const { guardCameraPermission, guardMicrophonePermission } =
        usePermission();
    const [chats, setChats] = useState<ChatListView[]>([]);

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
            await guardCameraPermission();
            await guardMicrophonePermission();

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
