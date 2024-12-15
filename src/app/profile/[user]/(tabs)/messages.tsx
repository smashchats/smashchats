import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

import { useLocalSearchParams } from "expo-router";
import { eq } from "drizzle-orm";
import { EncapsulatedSmashMessage, SmashDID } from "@smashchats/library";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box.jsx";
import ProfileMessagesScreenText from "@/src/components/ProfileMessagesScreenText.jsx";
import ProfileMessagesScreenDate from "@/src/components/ProfileMessagesScreenDate.jsx";
import ProfileMessagesScreenMetadata from "@/src/components/ProfileMessagesScreenMetadata.jsx";
import {
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext.js";
import { addSystemDateMessages } from "@/src/Utils.js";
import { drizzle_db } from "@/src/db/database";
import { useLiveTablesQuery } from "@/src/hooks/useLiveQuery";
import { messages as MessagesSchema } from "@/src/db/schema";
import { markAllMessagesInDiscussionAsRead } from "@/src/models/Messages";

export type Message = {
    content: string;
    sha256: string;
    from: string;
    type: string;
    date: Date;
};

// TODO: at some point use something similar to https://github.com/expo/react-native-invertible-scroll-view

export const ProfileMessages = ({ paddingTop }: { paddingTop: number }) => {
    const { user: peerId } = useLocalSearchParams();

    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

    const globalDispatch = useGlobalDispatch();
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
        globalDispatch({
            type: "USER_OPEN_DISCUSSION_ACTION",
            discussionId: peerId as string,
        });

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
                }))
            )
        );
    }, [db_messages]);

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

    // TODO load more messages on scroll upwards

    return (
        <Box flex={1} bg={Colors.background} h="100%">
            <ScrollView
                ref={scrollViewRef}
                contentInsetAdjustmentBehavior="automatic"
                stickyHeaderIndices={[1]}
                contentContainerStyle={{ justifyContent: "flex-start" }}
            >
                <Box marginHorizontal={10} paddingTop={paddingTop}>
                    <Box
                        width={"100%"}
                        bg={Colors.background}
                        paddingBottom={40}
                    >
                        {messages.map((m, idx) => {
                            let id = m.sha256 ?? `index-${idx}`;

                            switch (m.type) {
                                case "text":
                                    return (
                                        <ProfileMessagesScreenText
                                            key={`${m.type}-${id}`}
                                            message={m}
                                        />
                                    );
                                case "system-date":
                                    return (
                                        <ProfileMessagesScreenDate
                                            key={`${m.type}-${id}-index-${idx}`}
                                            date={m.date}
                                        />
                                    );
                                case "metadata":
                                    return (
                                        <ProfileMessagesScreenMetadata
                                            key={`${m.type}-${id}`}
                                            message={m}
                                        />
                                    );
                                case "profile":
                                    return <View key={`${m.type}-${id}`} />;
                                // TODO: improve UI
                                case "profiles":
                                    return (
                                        <ProfileMessagesScreenText
                                            key={`${m.type}-${id}`}
                                            message={{
                                                ...m,
                                                content:
                                                    "Several profiles [...]",
                                            }}
                                        />
                                    );
                                default:
                                    return (
                                        <Box key={`${m.type}-index-${idx}`} />
                                    );
                            }
                        })}
                    </Box>
                </Box>
            </ScrollView>
        </Box>
    );
};

export default ProfileMessages;
