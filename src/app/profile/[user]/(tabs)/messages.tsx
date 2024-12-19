import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

import { useLocalSearchParams } from "expo-router";
import { eq } from "drizzle-orm";
import { EncapsulatedSmashMessage, SmashDID } from "@smashchats/library";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box.jsx";
import { useGlobalState } from "@/src/context/GlobalContext.js";
import { addSystemDateMessages } from "@/src/Utils.js";
import { drizzle_db } from "@/src/db/database";
import { useLiveTablesQuery } from "@/src/hooks/useLiveQuery";
import { messages as MessagesSchema } from "@/src/db/schema";
import { markAllMessagesInDiscussionAsRead } from "@/src/models/Messages";
import { MessagesList } from "@/src/components/fragments/MessagesList";

export type Message = {
    content: string;
    sha256: string;
    from: string;
    fromMe: boolean;
    type: string;
    date: Date;
};

export const ProfileMessages = ({ paddingTop }: { paddingTop: number }) => {
    const { user: peerId } = useLocalSearchParams();

    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

    const globalState = useGlobalState();

    const { data: db_messages } = useLiveTablesQuery(
        drizzle_db
            .select()
            .from(MessagesSchema)
            .where(eq(MessagesSchema.discussion_id, peerId as string)),
        ["messages"]
    );

    const [messages, setMessages] = useState<Message[]>([]);

    const scrollViewRef = useRef(null);

    useEffect(() => {
        if (!hasScrolledToEnd && scrollViewRef.current) {
            (scrollViewRef.current as ScrollView).scrollToEnd({
                animated: false,
            });
            setHasScrolledToEnd(true);
        }
    }, [hasScrolledToEnd]);

    useEffect(() => {
        markAllMessagesInDiscussionAsRead(peerId as string).then(() => {
            console.debug(
                `messages::useEffect::Marked all messages in discussion ${peerId} as read`
            );
        });
    }, []);

    useEffect(() => {
        setMessages(
            addSystemDateMessages(
                (db_messages ?? []).map((m) => ({
                    ...m,
                    date: new Date(m.date_delivered ?? m.created_at),
                    content: m.data,
                    from: m.from_did_id,
                    fromMe: m.from_did_id === globalState.selfDid.id,
                }))
            )
        );
    }, [db_messages, globalState.selfDid]);

    useEffect(() => {
        const callback = (
            _message: EncapsulatedSmashMessage,
            from: SmashDID
        ) => {
            if (from.id === peerId) {
                markAllMessagesInDiscussionAsRead(peerId).then(() => {
                    console.debug(
                        `messages::onNewMessages::Marked received messages in discussion ${peerId} as read`
                    );
                });
            }
        };
        globalState.selfSmashUser.on("data", callback);
        return () => {
            globalState.selfSmashUser.removeListener("data", callback);
        };
    }, [globalState.selfSmashUser]);

    useEffect(() => {
        if (scrollViewRef.current && globalState.selfDid !== null) {
            (scrollViewRef.current as ScrollView).scrollToEnd({
                animated: false,
            });
        }
    }, [globalState.selfDid]);

    if (!globalState.selfDid) {
        return <View />;
    }

    return (
        <Box flex={1} bg={Colors.background} h="100%">
            <ScrollView
                ref={scrollViewRef}
                contentInsetAdjustmentBehavior="automatic"
                stickyHeaderIndices={[1]}
                contentContainerStyle={{ justifyContent: "flex-start" }}
            >
                <MessagesList messages={messages} paddingTop={paddingTop} />
            </ScrollView>
        </Box>
    );
};

export default ProfileMessages;
