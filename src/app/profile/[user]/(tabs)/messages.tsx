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
    Insets,
    ListRenderItem,
    ScrollView,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import Animated from "react-native-reanimated";
import { eq, desc, and, isNull, count } from "drizzle-orm";
import {
    EncapsulatedIMProtoMessage,
    DIDString,
    IM_CHAT_TEXT,
} from "@smashchats/library";

import { useGlobalState } from "@/src/context/GlobalContext.js";
import {
    addSystemMessages,
    appendOlderMessages,
} from "@/src/utils/MessagesUtils.js";
import { drizzle_db } from "@/src/db/database";
import { messages as MessagesSchema } from "@/src/db/schema";
import {
    Message,
    markAllMessagesInDiscussionAsRead,
} from "@/src/db/models/Messages";
import { RenderMessageListItem } from "@/src/components/fragments/MessagesList";
import { Colors } from "@/src/constants/Colors";
import { DisplayableMessage } from "@/src/types/";
const DEFAULT_LOAD_LIMIT = __DEV__ ? 10 : 100;

const getMessages = async (
    peerId: string,
    offset: number,
    limit: number
): Promise<Message[]> => {
    return await drizzle_db
        .select()
        .from(MessagesSchema)
        .where(eq(MessagesSchema.discussion_id, peerId))
        .orderBy(desc(MessagesSchema.created_at))
        .offset(offset)
        .limit(limit)
        .execute();
};

const getUnreadMessagesCount = async (peerId: string): Promise<number> => {
    const result = await drizzle_db
        .select({ count: count() })
        .from(MessagesSchema)
        .where(
            and(
                eq(MessagesSchema.discussion_id, peerId),
                isNull(MessagesSchema.date_read)
            )
        )
        .execute();
    return result[0].count;
};

const ProfileMessages = forwardRef<
    FlatList,
    {
        contentContainerStyle: StyleProp<ViewStyle>;
        scrollIndicatorInsets: Insets;
    }
>((props, ref) => {
    const globalState = useGlobalState();
    const { user: peerId } = useLocalSearchParams();
    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
    const [offset, setOffset] = useState(0);
    const keyExtractor = useCallback(
        (message: DisplayableMessage, index: number) => {
            switch (message.type) {
                case IM_CHAT_TEXT:
                case "metadata":
                case "profile":
                case "profiles":
                    return `${message.type}-${message.sha256}`;
                case "system-date":
                case "system-unread":
                    return `${message.type}-${message.sha256}-index-${index}`;
                default:
                    return `${message.type}-index-${index}`;
            }
        },
        []
    );
    const [messages, setMessages] = useState<DisplayableMessage[]>([]);

    const loadMoreMessages = async () => {
        const older_messages = await getMessages(
            peerId as string,
            offset,
            DEFAULT_LOAD_LIMIT
        );
        setOffset(offset + older_messages.length);
        setMessages(
            appendOlderMessages(
                older_messages,
                messages,
                globalState.selfDid.id
            )
        );
    };

    const scrollViewRef = useRef(null);

    useEffect(() => {
        (async () => {
            const unread_count = await getUnreadMessagesCount(peerId as string);
            const needToLoadMore = unread_count > DEFAULT_LOAD_LIMIT;

            let loadLimit = needToLoadMore ? unread_count : DEFAULT_LOAD_LIMIT;
            let newOffset = needToLoadMore
                ? unread_count - DEFAULT_LOAD_LIMIT + 1
                : DEFAULT_LOAD_LIMIT;

            setMessages(
                addSystemMessages(
                    await getMessages(peerId as string, 0, loadLimit),
                    globalState.selfDid.id
                )
            );
            setOffset(newOffset);
        })();
    }, []);

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
            {...props}
            inverted={true}
            ref={ref}
            style={styles.container}
            keyExtractor={keyExtractor}
            data={messages}
            renderItem={renderItem}
            onEndReached={() => loadMoreMessages()}
            onEndReachedThreshold={10}
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
