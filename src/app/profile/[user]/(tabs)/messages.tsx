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
    Pressable,
    StyleProp,
    TextInput,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import Animated from "react-native-reanimated";
import { eq, desc, and, isNull, count } from "drizzle-orm";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import {
    EncapsulatedIMProtoMessage,
    DIDString,
    IM_CHAT_TEXT,
    sha256,
    IMText,
    undefinedString,
    encapsulateMessage,
    IMProtoMessage,
} from "@smashchats/library";

import {
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext.js";
import {
    addSystemMessages,
    appendMessageToDisplayableMessages,
    appendOlderMessages,
} from "@/src/utils/MessagesUtils.js";
import { drizzle_db } from "@/src/db/database";
import { messages as MessagesSchema } from "@/src/db/schema";
import {
    Message,
    markAllMessagesInDiscussionAsRead,
    saveMessageToDb,
} from "@/src/db/models/Messages";
import { RenderMessageListItem } from "@/src/ui/fragments/MessagesList";
import { Colors } from "@/src/constants/Colors";
import { DisplayableMessage, EnrichedSmashMessage } from "@/src/types/";
import { Box } from "@/src/ui/design-system/layout";
import { MapContactToDid } from "@/src/utils/mappers/contacts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TrustedContact } from "@/src/db/models/Contacts";

const DEFAULT_LOAD_LIMIT = __DEV__ ? 10 : 100;

const FEATURE_FLAGS = {
    show_pictures_and_badges: false,
    send_media: false,
    show_smash_or_pass: false,
};

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
        onCollapse: (props: { animate: boolean }) => void;
        peer: TrustedContact;
    }
>((props, ref) => {
    const globalState = useGlobalState();
    const dispatch = useGlobalDispatch();

    const { user: peerId }: { user: string } = useLocalSearchParams();

    const [newMessage, setNewMessage] = useState("");
    const [shouldShowSendIcon, setShouldShowSendIcon] = useState(true);
    const inputFieldRef = useRef<TextInput>(null);

    const footerHeight = 60;
    const insets = useSafeAreaInsets();

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
            peerId,
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

    useEffect(() => {
        (async () => {
            const unread_count = await getUnreadMessagesCount(peerId);
            const needToLoadMore = unread_count > DEFAULT_LOAD_LIMIT;

            let loadLimit = needToLoadMore ? unread_count : DEFAULT_LOAD_LIMIT;
            let newOffset = needToLoadMore
                ? unread_count - DEFAULT_LOAD_LIMIT + 1
                : DEFAULT_LOAD_LIMIT;

            setMessages(
                addSystemMessages(
                    await getMessages(peerId, 0, loadLimit),
                    globalState.selfDid.id
                )
            );
            setOffset(newOffset);
        })();
    }, []);

    useEffect(() => {
        markAllMessagesInDiscussionAsRead(peerId).then(() => {
            globalState.logger.debug(
                `messages::useEffect::Marked all messages in discussion ${peerId} as read`
            );
        });
    }, []);

    const appendMessage = ({
        data,
        sha256,
        after_sha256,
    }: {
        data: any;
        sha256: sha256;
        after_sha256: sha256 | undefinedString;
    }) => {
        const now = new Date();

        setMessages(
            appendMessageToDisplayableMessages(
                {
                    type: IM_CHAT_TEXT,
                    from_did_id: globalState.selfDid.id,
                    discussion_id: peerId,
                    data,
                    sha256,
                    after_sha256,
                    created_at: now,
                    date_delivered: now,
                    date_read: now,
                    timestamp: now,
                    reply_to_sha256: null,
                } satisfies Message,
                messages,
                globalState.selfDid.id
            )
        );
    };

    useEffect(() => {
        const callback = (
            senderId: DIDString,
            originalMessage: IMProtoMessage
        ) => {
            const message = originalMessage as EncapsulatedIMProtoMessage; // TODO remove "as" when lib exports proper types

            if (senderId === peerId) {
                markAllMessagesInDiscussionAsRead(peerId).then(() => {
                    globalState.logger.debug(
                        `messages::onNewMessages::Marked received messages in discussion ${peerId} as read`
                    );
                });
                // TODO scroll to bottom (?)

                // TODO check if the message is correctly formatted
                appendMessage({
                    data: message.data as string,
                    sha256: message.sha256,
                    after_sha256: message.after,
                });
            }
        };
        globalState.selfSmashUser.on(IM_CHAT_TEXT, callback);
        return () => {
            globalState.selfSmashUser.removeListener("data", callback);
        };
    }, [globalState.selfSmashUser]);

    const renderItem = useCallback<ListRenderItem<DisplayableMessage>>(
        ({ item }) => <RenderMessageListItem message={item} />,
        []
    );

    useEffect(() => {
        setShouldShowSendIcon(newMessage.length > 0);
    }, [newMessage]);

    const handleSendMessage = async () => {
        const dataToSend = newMessage.trim();
        if (dataToSend.length === 0) {
            return;
        }
        setNewMessage("");

        const lastMessageId: sha256 | undefinedString =
            globalState.latestMessageIdInDiscussion[peerId] ?? "0";

        const message = await encapsulateMessage(
            new IMText(dataToSend, lastMessageId)
        );
        const { sha256, timestamp } = message;

        appendMessage({
            data: dataToSend,
            sha256,
            after_sha256: lastMessageId,
        });

        saveMessageToDb(
            {
                fromDid: globalState.selfDid.id,
                toDiscussionId: peerId as DIDString,
                data: dataToSend,
                sha256,
                timestamp,
                type: IM_CHAT_TEXT,
                after: lastMessageId,
            } satisfies EnrichedSmashMessage,
            {
                date_read: new Date(),
            }
        );

        dispatch({
            type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION",
            discussionId: peerId,
            messageId: sha256,
        });

        try {
            await globalState.selfSmashUser.send(
                MapContactToDid(props.peer),
                message
            );

            // TODO: update message in db as successfully sent to SME
        } catch (error) {
            // TODO: mark message as failed to send to SME
            globalState.logger.error(
                `messages::handleSendMessage::Error sending message to SME: ${error}`
            );
        }
    };

    const handleSendMedia = async () => {
        if (!FEATURE_FLAGS.send_media) {
            return;
        }

        let { canceled, assets } = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.2,
        });
        if (canceled) {
            return;
        }
        globalState.logger.info("assets", assets);
    };

    if (!globalState.selfDid) {
        return <View />;
    }

    return (
        <Box flex={1} backgroundColor={Colors.background}>
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
            <Pressable onPress={() => inputFieldRef.current?.focus()}>
                <Box
                    backgroundColor={Colors.background}
                    h={footerHeight + insets.bottom + 900}
                    bottom={-insets.bottom + 30}
                    width={"102%"}
                    marginBottom={-900}
                    left={"-1%"}
                    position="relative"
                    borderColor={Colors.darkGray}
                    borderBottomWidth={0}
                    borderWidth={3}
                    borderRadius={20}
                >
                    <TextInput
                        ref={inputFieldRef}
                        placeholder="Share something..."
                        placeholderTextColor={Colors.textGray}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        style={{
                            color: "white",
                            padding: 15,
                            marginRight: 60,
                        }}
                        onFocus={() => props.onCollapse({ animate: true })}
                    />

                    <Pressable
                        style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            padding: 20,
                        }}
                        onPress={handleSendMessage}
                    >
                        <Feather
                            name="chevron-right"
                            size={24}
                            color={
                                shouldShowSendIcon
                                    ? Colors.textWhite
                                    : Colors.darkGray
                            }
                        />
                    </Pressable>

                    {!shouldShowSendIcon && FEATURE_FLAGS.send_media && (
                        <Pressable
                            style={styles.floatingActionButton}
                            onPress={handleSendMedia}
                        >
                            <Feather name="paperclip" size={28} color="white" />
                        </Pressable>
                    )}
                </Box>
            </Pressable>
        </Box>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
    },
    floatingActionButton: {
        width: 50,
        height: 50,
        position: "absolute",
        right: 0,
        bottom: 0,
        top: "50%",
        backgroundColor: Colors.purple,
        borderRadius: 25,
        marginRight: 20,
        marginBottom: 40,
        transform: [{ translateY: -45 }],
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99,
    },
});

export default memo(ProfileMessages);
