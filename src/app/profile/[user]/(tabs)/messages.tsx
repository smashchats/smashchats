import React, {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    FlatList,
    FlatListProps,
    ListRenderItem,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { eq } from "drizzle-orm";
import {
    EncapsulatedIMProtoMessage,
    DIDString,
    IM_CHAT_TEXT,
} from "@smashchats/library";

import { useGlobalState } from "@/src/context/GlobalContext.js";
import { addSystemDateMessages } from "@/src/utils/Utils.js";
import { drizzle_db } from "@/src/db/database";
import { useLiveTablesQuery } from "@/src/hooks/useLiveQuery";
import { messages as MessagesSchema } from "@/src/db/schema";
import { markAllMessagesInDiscussionAsRead } from "@/src/db/models/Messages";
import { RenderMessageListItem } from "@/src/components/fragments/MessagesList";
import Animated from "react-native-reanimated";
import { Colors } from "@/src/constants/Colors";

export type DisplayableMessage = {
    content: string;
    sha256: string;
    from: string;
    fromMe: boolean;
    type: string;
    date: Date;
};

type Props = Omit<FlatListProps<DisplayableMessage>, "renderItem" | "data">;

const ProfileMessages = forwardRef<
    Animated.FlatList<DisplayableMessage>,
    Props
>((props, ref) => {
    const keyExtractor = useCallback(
        (_: DisplayableMessage, index: number) => index.toString(),
        []
    );
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

    const [messages, setMessages] = useState<DisplayableMessage[]>([]);

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
            globalState.logger.debug(
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
            senderId: DIDString,
            message: EncapsulatedIMProtoMessage
        ) => {
            if (senderId === peerId && message.type === IM_CHAT_TEXT) {
                markAllMessagesInDiscussionAsRead(peerId).then(() => {
                    globalState.logger.debug(
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

    // useEffect(() => {
    //     if (scrollViewRef.current && globalState.selfDid !== null) {
    //         (scrollViewRef.current as ScrollView).scrollToEnd({
    //             animated: false,
    //         });
    //     }
    // }, [globalState.selfDid]);

    const renderItem = useCallback<ListRenderItem<DisplayableMessage>>(
        ({ item, index }) => (
            <RenderMessageListItem message={item} idx={index} />
        ),
        []
    );

    if (!globalState.selfDid) {
        return <View />;
    }

    return (
        <Animated.FlatList
            ref={ref}
            style={styles.container}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            {...props}
            data={messages}
        />
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
    },
});

export default memo(ProfileMessages);
