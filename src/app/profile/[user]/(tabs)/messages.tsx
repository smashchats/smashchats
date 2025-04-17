import React, {
    RefObject,
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    FlatList,
    Insets,
    ListRenderItem,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
    NativeSyntheticEvent,
    NativeScrollEvent,
    LayoutChangeEvent,
    Alert,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import Animated, {
    ScrollHandlerProcessed,
    runOnJS,
    useAnimatedScrollHandler,
    useComposedEventHandler,
} from "react-native-reanimated";
import { eq, desc, and, sql } from "drizzle-orm";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
    useAudioRecorder,
    RecordingPresets,
    AudioModule,
    setAudioModeAsync,
} from "expo-audio";

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
    IM_MEDIA_EMBEDDED,
    IMMediaEmbedded,
    IMMediaEmbeddedMessage,
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
    saveMediaFromBase64,
    getMediaTypeFromMimeType,
    MediaMetadata,
    saveMediaFromUri,
    getMediaBytes,
} from "@/src/utils/MediaStorage";
import { Text } from "@/src/ui/design-system/Text";
import { formatDuration } from "@/src/utils/TimeUtils";

const DEFAULT_LOAD_LIMIT = __DEV__ ? 10 : 100;

const FEATURE_FLAGS = {
    show_pictures_and_badges: true,
    send_media: true,
    show_smash_or_pass: true,
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
>(function ProfileMessages(props, ref) {
    const globalState = useGlobalState();
    const dispatch = useGlobalDispatch();

    const { user: peerId }: { user: string } = useLocalSearchParams();

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const durationInterval = useRef<NodeJS.Timeout | null>(null);

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
                case IM_MEDIA_EMBEDDED:
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
        globalState.logger.debug("loadMoreMessages");
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
        if (!globalState.selfDid?.id) {
            return;
        }
        const onDiscussionLoad_LoadMessages = async () => {
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
                globalState.selfDid?.id
            );
            setMessages(enrichedMessages);
            setOffset(newOffset);
        };
        onDiscussionLoad_LoadMessages();
    }, [peerId, globalState.logger, dispatch, globalState.selfDid, globalState.selfDid?.id]);

    useEffect(() => {
        if (!globalState.selfDid?.id) {
            return;
        }
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
    }, [peerId, globalState.logger, globalState.selfSmashUser, globalState.selfDid, globalState.selfDid?.id]);

    const getterForMessages = () => {
        return messages;
    };

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
                getterForMessages(),
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
                dispatch({
                    type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION",
                    discussionId: peerId,
                    messageId: message.sha256,
                });
                if (
                    message.type === IM_MEDIA_EMBEDDED &&
                    (message as IMMediaEmbeddedMessage).data.mimeType.split(
                        "/"
                    )[0] !== "audio"
                ) {
                    dispatch({
                        type: "ADD_SHOWN_MEDIA_IN_GALLERY_ACTION",
                        uri:
                            "data:image/png;base64," +
                            (message as IMMediaEmbeddedMessage).data.content,
                    });
                }

                if (!hasUserScrolledToOlderMessages) {
                    scrollToBottom();
                }

                // TODO: find file URI for media messages instead of using base64
                const displayable_data =
                    message.type === IM_MEDIA_EMBEDDED
                        ? "data:image/png;base64," +
                          (message as IMMediaEmbeddedMessage).data.content
                        : message.data;

                appendMessage({
                    data: displayable_data as string,
                    sha256: message.sha256,
                    after_sha256: message.after,
                    from_self: false,
                    type: message.type,
                });
            }
        };
        // SUPPORT FOR NEW MESSAGE TYPES SHOULD BE ADDED HERE
        globalState.selfSmashUser.on(IM_CHAT_TEXT, onNewMessageByPeer);
        globalState.selfSmashUser.on(IM_MEDIA_EMBEDDED, onNewMessageByPeer);
        return () => {
            [IM_CHAT_TEXT, IM_MEDIA_EMBEDDED].forEach((type) => {
                globalState.selfSmashUser.removeListener(
                    type,
                    onNewMessageByPeer
                );
            });
        };
    }, [globalState.selfSmashUser, messages]);

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

    const createTextMessage = async (
        content: string
    ): Promise<IMProtoMessage> => {
        const lastMessageId: sha256 | undefinedString =
            globalState.latestMessageIdInDiscussion[peerId] ?? "0";

        const message = await encapsulateMessage(
            new IMText(content, lastMessageId)
        );
        message.type = IM_CHAT_TEXT;
        return message;
    };

    const createMediaMessage = async (
        asset: ImagePicker.ImagePickerAsset,
        mediaType: "image" | "video" | "audio"
    ): Promise<{ message: IMProtoMessage; metadata: MediaMetadata }> => {
        const mediaMetadata = await saveMediaFromBase64(
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

        const lastMessageId: sha256 | undefinedString =
            globalState.latestMessageIdInDiscussion[peerId] ?? "0";

        const message = IMMediaEmbedded.fromBase64(
            asset.base64!,
            asset.mimeType!
        );
        message.after = lastMessageId;

        const messageWithMetadata = {
            ...message,
            sha256: mediaMetadata.sha256 as sha256,
            timestamp: new Date().toISOString() as ISO8601,
        };

        return { message: messageWithMetadata, metadata: mediaMetadata };
    };

    const saveMessageToLocalDb = async (
        message: IMProtoMessage,
        mediaMetadata?: MediaMetadata
    ): Promise<void> => {
        const { db_data, displayable_data } = getMessageData(
            message,
            mediaMetadata
        );

        appendMessage({
            data: displayable_data,
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

        await saveMessageToDb(msg, {
            date_read: new Date(),
        });

        dispatch({
            type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION",
            discussionId: peerId,
            messageId: message.sha256 as sha256,
        });
    };

    const getMessageData = (
        message: IMProtoMessage,
        mediaMetadata?: MediaMetadata
    ): { db_data: string; displayable_data: string } => {
        switch (message.type) {
            case IM_CHAT_TEXT:
                return {
                    db_data: message.data as string,
                    displayable_data: message.data as string,
                };
            case IM_MEDIA_EMBEDDED:
                return {
                    db_data: "",
                    displayable_data: mediaMetadata?.file_path ?? "",
                };
            default:
                throw new Error(`Unknown message type: ${message.type}`);
        }
    };

    const sendMessage = async (
        message: IMProtoMessage,
        mediaMetadata?: MediaMetadata
    ): Promise<void> => {
        try {
            await saveMessageToLocalDb(message, mediaMetadata);
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
            throw error;
        }
    };

    const handleSendMessage = async () => {
        const dataToSend = newMessage.trim();
        if (dataToSend.length === 0) {
            return;
        }
        setNewMessage("");

        createTextMessage(dataToSend).then((message) => sendMessage(message));
        await markContactAsActive(peerId);
    };

    const handleSendMedia = async () => {
        if (!FEATURE_FLAGS.send_media) {
            return;
        }

        const { canceled, assets } = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos", "livePhotos"],
            quality: 0.2,
            base64: true,
        });

        if (canceled || !assets) {
            return;
        }

        const asset = assets[0];
        const mediaType = getMediaTypeFromMimeType(asset.mimeType!);
        const { message, metadata } = await createMediaMessage(
            asset,
            mediaType
        );
        await sendMessage(message, metadata);
        await markContactAsActive(peerId);
    };

    // Request permissions on mount
    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert(
                    "Permission required",
                    "Please grant microphone access to record audio messages."
                );
            }
        })();
    }, []);

    const startRecording = async () => {
        try {
            dispatch({
                type: "STOP_MEDIA_ACTION",
            });

            await setAudioModeAsync({
                playsInSilentMode: true,
                shouldRouteThroughEarpiece: true,
                allowsRecording: true,
                shouldPlayInBackground: true,
            });

            await audioRecorder.prepareToRecordAsync({
                ...RecordingPresets.HIGH_QUALITY,
                isMeteringEnabled: true,
            });
            audioRecorder.record();
            setIsRecording(true);
            setRecordingDuration(0);

            // Start duration timer
            durationInterval.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording", err);
            Alert.alert("Error", "Failed to start recording");
        }
    };

    const stopRecording = async () => {
        try {
            // Clear duration timer
            if (durationInterval.current) {
                clearInterval(durationInterval.current);
                durationInterval.current = null;
            }

            await audioRecorder.stop();
            setIsRecording(false);
            setRecordingDuration(0);

            const uri = audioRecorder.uri;
            if (uri) {
                console.debug("Recording saved at:", uri);

                await handleRecordingFinished(uri);
            }
        } catch (err) {
            console.error("Failed to stop recording", err);
            Alert.alert("Error", "Failed to stop recording");
        }
    };

    const handleRecordingFinished = async (uri: string) => {
        try {
            const audioMetadata = await saveMediaFromUri(
                uri,
                "audio/m4a",
                "audio",
                { duration: recordingDuration }
            );

            await sendAudioMessage(audioMetadata);

            setRecordingDuration(0);
            setIsRecording(false);
        } catch (error) {
            console.error("Error handling recording finished:", error);
            Alert.alert("Error", "Failed to save audio recording");
        }
    };

    const sendAudioMessage = async (audioMetadata: MediaMetadata) => {
        try {
            const lastMessageId: string =
                globalState.latestMessageIdInDiscussion[peerId] ?? "0";

            const mediaBytes = await getMediaBytes(audioMetadata.file_path);
            if (!mediaBytes) {
                throw new Error("Failed to get media bytes");
            }

            const message = IMMediaEmbedded.fromBase64(
                mediaBytes,
                audioMetadata.mime_type
            );

            const messageWithMetadata = {
                ...message,
                after: lastMessageId as `${string & { length: 64 }}`,
                sha256: audioMetadata.sha256 as `${string & { length: 64 }}`,
                timestamp: new Date().toISOString() as ISO8601,
            };

            await sendMessage(messageWithMetadata);
            await markContactAsActive(peerId);
        } catch (error) {
            console.error("Error sending audio message:", error);
            Alert.alert("Error", "Failed to send audio message");
        }
    };

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (durationInterval.current) {
                clearInterval(durationInterval.current);
            }
        };
    }, []);

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

            <MessageInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={handleSendMessage}
                onSendMedia={handleSendMedia}
                onCollapse={props.onCollapse}
                isRecording={isRecording}
                recordingDuration={recordingDuration}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                shouldShowSendIcon={shouldShowSendIcon}
                footerHeight={footerHeight}
                insets={insets}
            />
        </Box>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
    },
});

export default memo(ProfileMessages);
