import React, {
    RefObject,
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
    NativeSyntheticEvent,
    NativeScrollEvent,
    LayoutChangeEvent,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import Animated, {
    ScrollHandlerProcessed,
    runOnJS,
    useAnimatedScrollHandler,
    useComposedEventHandler,
} from "react-native-reanimated";
import { eq, desc, and, sql } from "drizzle-orm";
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
    MessageStatus,
    ISO8601,
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
import { messages as MessagesSchema, media } from "@/src/db/schema";
import {
    Message,
    markAllMessagesNotFromSelfInDiscussionAsRead,
    saveMessageToDb,
} from "@/src/db/models/Messages";
import { RenderMessageListItem } from "@/src/ui/fragments/MessagesList";
import { Colors } from "@/src/constants/Colors";
import { DisplayableMessage, EnrichedSmashMessage } from "@/src/types/";
import { Box } from "@/src/ui/design-system/layout";
import { MapContactToDidDocument } from "@/src/utils/mappers/contacts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TrustedContact } from "@/src/types/Contacts.types";
import { markContactAsActive } from "@/src/db/models/Contacts";
import {
    SMASH_MEDIA_VIDEO,
    SMASH_MEDIA_PHOTO,
} from "@/src/types/smash/lexicons";
import { saveMedia, getMediaTypeFromMimeType, MediaMetadata } from "@/src/utils/MediaStorage";

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
    const results = await drizzle_db
        .select({
            message: MessagesSchema,
            media: media,
        })
        .from(MessagesSchema)
        .leftJoin(media, eq(MessagesSchema.sha256, media.sha256))
        .where(eq(MessagesSchema.discussion_id, peerId))
        .orderBy(desc(MessagesSchema.created_at))
        .offset(offset)
        .limit(limit)
        .execute();

    return results.map(({ message, media }) => ({
        ...message,
        status: message.status as MessageStatus,
        media: media || null,
    }));
};

const getUnreadMessagesCount = async (peerId: string): Promise<number> => {
    const result = await drizzle_db
        .select({ count: sql<number>`count(*)` })
        .from(MessagesSchema)
        .where(
            and(
                eq(MessagesSchema.discussion_id, peerId),
                eq(MessagesSchema.status, "received")
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
        onCollapse: () => void;
        onMomentumScrollEnd?: (
            event: NativeSyntheticEvent<NativeScrollEvent>
        ) => void;
        peer: TrustedContact;
        onScroll: ScrollHandlerProcessed;
        onLayout: (event: LayoutChangeEvent) => void;
    }
>((props, ref) => {
    const globalState = useGlobalState();
    const dispatch = useGlobalDispatch();

    const { user: peerId }: { user: string } = useLocalSearchParams();

    const [newMessage, setNewMessage] = useState(
        globalState.chatList.drafts[peerId] ?? ""
    );
    const [shouldShowSendIcon, setShouldShowSendIcon] = useState(true);
    const inputFieldRef = useRef<TextInput>(null);

    const [hasUserScrolledToOlderMessages, setHasUserScrolledToOlderMessages] =
        useState(false);

    const scrollToBottom = () => {
        (ref as RefObject<FlatList>)?.current?.scrollToOffset({
            offset: 0,
            animated: true,
        });
    };

    const footerHeight = 60;
    const insets = useSafeAreaInsets();

    const [offset, setOffset] = useState(0);

    // SUPPORT FOR NEW MESSAGE TYPES SHOULD BE ADDED HERE
    const keyExtractor = useCallback(
        (message: DisplayableMessage, index: number) => {
            switch (message.type) {
                case IM_CHAT_TEXT:
                case SMASH_MEDIA_PHOTO:
                case SMASH_MEDIA_VIDEO:
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
        return;
        globalState.logger.info("loadMoreMessages");
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
            const needToLoadMoreThanDefaultThreshold =
                unread_count > DEFAULT_LOAD_LIMIT;

            let loadLimit = needToLoadMoreThanDefaultThreshold
                ? unread_count
                : DEFAULT_LOAD_LIMIT;
            let newOffset = needToLoadMoreThanDefaultThreshold
                ? unread_count - DEFAULT_LOAD_LIMIT + 1
                : DEFAULT_LOAD_LIMIT;

            const databaseMessages = await getMessages(peerId, 0, loadLimit);

            dispatch({
                type: "CHAT_LIST_DRAFT_CLEAR_ACTION",
                did_id: peerId,
            });

            if (databaseMessages.length > 0) {
                const lastMessageId = databaseMessages[
                    databaseMessages.length - 1
                ].sha256 as sha256;
                dispatch({
                    type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION",
                    discussionId: peerId,
                    messageId: lastMessageId,
                });
                globalState.logger.info(
                    `messages::useEffect::Latest message id in discussion ${peerId} set to ${lastMessageId}`
                );
            }

            const enrichedMessages = addSystemMessages(
                databaseMessages,
                globalState.selfDid.id
            );
            setMessages(enrichedMessages);
            setOffset(newOffset);
        })();
    }, []);

    useEffect(() => {
        markAllMessagesNotFromSelfInDiscussionAsRead(
            peerId,
            globalState.selfDid.id
        ).then((unreadMessages) => {
            globalState.selfSmashUser.ackMessagesRead(
                peerId as DIDString,
                unreadMessages
            );
            globalState.logger.debug(
                `messages::useEffect::Marked all messages in discussion ${peerId} as read`
            );
        });
    }, []);

    const appendMessage = ({
        data,
        sha256,
        after_sha256,
        from_self,
        type,
    }: {
        data: any;
        sha256: sha256;
        after_sha256: sha256 | undefinedString;
        from_self: boolean;
        type: string;
    }) => {
        const now = new Date();

        setMessages(
            appendMessageToDisplayableMessages(
                {
                    type,
                    from_did_id: from_self ? globalState.selfDid.id : peerId,
                    discussion_id: peerId,
                    data,
                    sha256,
                    after_sha256,
                    created_at: now,
                    date_delivered: now,
                    date_read: now,
                    timestamp: now,
                    reply_to_sha256: null,
                    status: from_self
                        ? ("sending" as MessageStatus)
                        : "received",
                } satisfies Message,
                messages,
                globalState.selfDid.id
            )
        );
    };

    useEffect(() => {
        const onNewMessageByPeer = (
            senderId: DIDString,
            originalMessage: IMProtoMessage
        ) => {
            const message = originalMessage as EncapsulatedIMProtoMessage; // TODO remove "as" when lib exports proper types

            if (senderId === peerId) {
                markAllMessagesNotFromSelfInDiscussionAsRead(
                    peerId,
                    globalState.selfDid.id
                ).then(() => {
                    globalState.logger.debug(
                        `messages::onNewMessages::Marked received messages in discussion ${peerId} as read`
                    );
                });
                globalState.selfSmashUser.ackMessagesRead(peerId, [
                    message.sha256,
                ]);

                if (!hasUserScrolledToOlderMessages) {
                    scrollToBottom();
                }

                appendMessage({
                    data: message.data as string,
                    sha256: message.sha256,
                    after_sha256: message.after,
                    from_self: false,
                    type: message.type,
                });
            }
        };
        globalState.selfSmashUser.on(IM_CHAT_TEXT, onNewMessageByPeer);
        return () => {
            globalState.selfSmashUser.removeListener(
                "data",
                onNewMessageByPeer
            );
        };
    }, [globalState.selfSmashUser]);

    const renderItem = useCallback<ListRenderItem<DisplayableMessage>>(
        ({ item }) => <RenderMessageListItem message={item} />,
        []
    );

    useEffect(() => {
        setShouldShowSendIcon(newMessage.length > 0);
    }, [newMessage]);

    const onScroll = useAnimatedScrollHandler((event) => {
        runOnJS(setHasUserScrolledToOlderMessages)(event.contentOffset.y > 100);
    });

    const composedOnScrollHandler = useComposedEventHandler([
        props.onScroll,
        onScroll,
    ]);

    const sendMessage = async (message: IMProtoMessage, mediaMetadata?: MediaMetadata) => {
        let db_data: string;

        switch (message.type) {
            case IM_CHAT_TEXT:
                db_data = message.data as string;
                break;
            // TODO: save media somewhere permanent, return uri
            case SMASH_MEDIA_PHOTO:
            case SMASH_MEDIA_VIDEO:
                db_data = mediaMetadata?.file_path ?? "";
                break;
            default:
                throw new Error(`Unknown message type: ${message.type}`);
        }

        appendMessage({
            data: db_data,
            sha256: message.sha256 as sha256,
            after_sha256: message.after as sha256,
            from_self: true,
            type: message.type,
        });

        const msg = {
            fromDid: globalState.selfDid.id,
            toDiscussionId: peerId as DIDString,
            data: db_data,
            sha256: message.sha256 as sha256,
            timestamp: message.timestamp!,
            type: message.type,
            after: message.after as sha256,
        } satisfies EnrichedSmashMessage;

        saveMessageToDb(msg, {
            date_read: new Date(),
        });

        dispatch({
            type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION",
            discussionId: peerId,
            messageId: message.sha256 as sha256,
        });

        try {
            await globalState.selfSmashUser.send(
                MapContactToDidDocument(props.peer),
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

    const handleSendMessage = async () => {
        const dataToSend = newMessage.trim();
        if (dataToSend.length === 0) {
            return;
        }
        setNewMessage("");

        markContactAsActive(peerId).then();

        const lastMessageId: sha256 | undefinedString =
            globalState.latestMessageIdInDiscussion[peerId] ?? "0";

        const message = await encapsulateMessage(
            new IMText(dataToSend, lastMessageId)
        );
        message.type = IM_CHAT_TEXT;

        sendMessage(message);
    };

    const handleSendMedia = async () => {
        if (!FEATURE_FLAGS.send_media) {
            return;
        }

        let { canceled, assets } = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos", "livePhotos"],
            quality: 0.2,
            base64: true,
        });
        if (canceled || !assets) {
            return;
        }
        markContactAsActive(peerId).then();

        const asset = assets[0];
        const mediaType = getMediaTypeFromMimeType(asset.mimeType!);

        // Save media to storage and database
        const mediaMetadata = await saveMedia(
            asset.base64!,
            asset.mimeType!,
            mediaType,
            {
                width: asset.width,
                height: asset.height,
                duration: asset.duration ?? undefined,
                generateThumbnail:
                    mediaType === "video" || mediaType === "image",
            }
        );

        const dataToSend = {
            data: asset.base64!,
            mimeType: asset.mimeType!,
        };

        const lastMessageId: sha256 | undefinedString =
            globalState.latestMessageIdInDiscussion[peerId] ?? "0";

        const message = {
            ...dataToSend,
            sha256: mediaMetadata.sha256 as sha256,
            timestamp: new Date().toISOString() as ISO8601,
            after: lastMessageId,
            type: mediaType === "video" ? SMASH_MEDIA_VIDEO : SMASH_MEDIA_PHOTO,
        } satisfies IMProtoMessage;

        sendMessage(message, mediaMetadata);
    };

    if (!globalState.selfDid) {
        return <View />;
    }

    return (
        <Box flex={1} backgroundColor={Colors.background}>
            <Animated.FlatList
                {...props}
                onScroll={composedOnScrollHandler}
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
                        returnKeyType="send"
                        placeholderTextColor={Colors.textGray}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        onBlur={() => {
                            dispatch({
                                type: "CHAT_LIST_DRAFT_ACTION",
                                draft: newMessage,
                                did_id: peerId,
                            });
                        }}
                        onSubmitEditing={handleSendMessage}
                        style={{
                            color: "white",
                            padding: 15,
                            marginRight: 60,
                        }}
                        onFocus={() => props.onCollapse()}
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
        top: -30,
        backgroundColor: Colors.purple,
        borderRadius: 25,
        marginRight: 20,
        marginBottom: 40,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
    messageContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
});

export default memo(ProfileMessages);
