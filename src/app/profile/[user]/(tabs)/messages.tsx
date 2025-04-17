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
import * as ImagePicker from "expo-image-picker";

import { IMProtoMessage, DIDString } from "@smashchats/library";

import {
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext.js";
import { RenderMessageListItem } from "@/src/ui/fragments/MessagesList";
import { Colors } from "@/src/constants/Colors";
import { DisplayableMessage } from "@/src/types/";
import { Box } from "@/src/ui/design-system/layout";
import { MapContactToDidDocument } from "@/src/utils/mappers/contacts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TrustedContact } from "@/src/types/Contacts.types";
import { markContactAsActive } from "@/src/db/models/Contacts";
import {
    getMediaTypeFromMimeType,
    MediaMetadata,
} from "@/src/utils/MediaStorage";
import { MessageInput } from "@/src/components/MessageInput";
import { useMessages } from "@/src/hooks/useMessages";
import { useAudioRecorder } from "@/src/hooks/useAudioRecorder";
import {
    createTextMessage,
    createMediaMessage,
    saveMessageFromSelfToLocalDb,
    sendAudioMessage,
} from "@/src/utils/messageHandlers";

const FEATURE_FLAGS = {
    show_pictures_and_badges: true,
    send_media: true,
    show_smash_or_pass: true,
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
    const [newMessage, setNewMessage] = useState(
        globalState.chatList.drafts[peerId] ?? ""
    );
    const [shouldShowSendIcon, setShouldShowSendIcon] = useState(true);

    const scrollToBottom = () => {
        (ref as RefObject<FlatList>)?.current?.scrollToOffset({
            offset: 0,
            animated: true,
        });
    };

    const footerHeight = 60;
    const insets = useSafeAreaInsets();

    const {
        messages,
        loadMoreMessages,
        keyExtractor,
        appendMessage,
        setHasUserScrolledToOlderMessages,
    } = useMessages(peerId, scrollToBottom);

    const onRecordingFinished = async (audioMetadata: MediaMetadata) => {
        try {
            const lastMessageId =
                globalState.latestMessageIdInDiscussion[peerId] ?? "0";

            await sendAudioMessage(
                audioMetadata,
                lastMessageId,
                peerId as DIDString,
                sendMessage
            );
        } catch (error) {
            console.error("Error handling recording finished:", error);
            Alert.alert("Error", "Failed to save audio recording");
        }
    };

    const { isRecording, recordingDuration, startRecording, stopRecording } =
        useAudioRecorder({ onRecordingFinished });

    const renderItem = useCallback<ListRenderItem<DisplayableMessage>>(
        ({ item }) => <RenderMessageListItem message={item} />,
        []
    );

    useEffect(() => {
        if (newMessage.length === 0) {
            dispatch({
                type: "CHAT_LIST_DRAFT_CLEAR_ACTION",
                did_id: peerId,
            });
        }
        setShouldShowSendIcon(newMessage.length > 0);
    }, [newMessage, dispatch, peerId]);

    const onScroll = useAnimatedScrollHandler((event) => {
        runOnJS(setHasUserScrolledToOlderMessages)(event.contentOffset.y > 100);
    });

    const composedOnScrollHandler = useComposedEventHandler([
        props.onScroll,
        onScroll,
    ]);

    const sendMessage = async (
        message: IMProtoMessage,
        mediaMetadata?: MediaMetadata
    ): Promise<void> => {
        try {
            await saveMessageFromSelfToLocalDb(
                message,
                globalState.selfDid.id as DIDString,
                peerId as DIDString,
                mediaMetadata
            );

            appendMessage({
                data: mediaMetadata?.file_path ?? (message.data as string),
                sha256: message.sha256 as `${string & { length: 64 }}`,
                after_sha256: message.after,
                from_self: true,
                type: message.type,
            });

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

        const lastMessageId =
            globalState.latestMessageIdInDiscussion[peerId] ?? "0";
        const message = await createTextMessage(dataToSend, lastMessageId);
        await sendMessage(message);
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
        const lastMessageId =
            globalState.latestMessageIdInDiscussion[peerId] ?? "0";

        const { message, metadata } = await createMediaMessage(
            asset,
            mediaType,
            lastMessageId
        );

        await sendMessage(message, metadata);
        await markContactAsActive(peerId);
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
