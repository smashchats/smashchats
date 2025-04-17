import * as ImagePicker from "expo-image-picker";

import {
    DIDString,
    IM_CHAT_TEXT,
    Logger,
    SmashUser,
    IM_PROFILE,
    IM_SESSION_RESET,
    DIDDocument,
    MessagingEventMap,
    MessageStatus,
    sha256,
    SMASH_PROFILE_LIST,
    EncapsulatedIMProtoMessage,
    IMProtoMessage,
    IMProfileMessage,
    SmashProfileList,
    IMTextMessage,
    IM_MEDIA_EMBEDDED,
    reverseDNS,
    IMMediaEmbeddedMessage,
    IMMediaEmbedded,
    IMText,
    encapsulateMessage,
    ISO8601,
    undefinedString,
} from "@smashchats/library";

import {
    saveMessageToDb,
    updateMessagesStatus,
} from "@/src/db/models/Messages";
import {
    saveContactToDb,
    updateContact,
    ContactInsert,
    markContactAsActive,
} from "@/src/db/models/Contacts";
import { mapReceivedMessageToEnrichedMessage } from "@/src/utils/mappers/messages";
import { SmashProfileToContactMapper } from "@/src/utils/mappers/contacts";
import { EncapsulatedMessage } from "@/src/types/smash/lexicons";
import {
    getMediaTypeFromMimeType,
    saveMediaFromBase64,
    MediaMetadata,
    getMediaBytes,
} from "@/src/utils/MediaStorage";
import { EnrichedSmashMessage } from "@/src/types/";

const SUPPORTED_MESSAGE_TYPES: reverseDNS[] = [
    IM_CHAT_TEXT,
    IM_PROFILE,
    IM_MEDIA_EMBEDDED,
];

const IGNORED_MESSAGE_TYPES = [IM_SESSION_RESET];

// SUPPORT FOR NEW MESSAGE TYPES SHOULD BE ADDED HERE
export const firehoseListener =
    (logger: Logger) =>
    async (_senderDid: DIDString, message: IMProtoMessage) => {
        if (
            ![...SUPPORTED_MESSAGE_TYPES, ...IGNORED_MESSAGE_TYPES].includes(
                message.type
            )
        ) {
            logger.debug("message received", message);
            logger.warn("unhandled message type", message.type);
        }
    };

export const profileMessagesListener =
    (logger: Logger) =>
    async (_sender: DIDString, message: IMProfileMessage) => {
        logger.debug("parsing profile message", JSON.stringify(message.data));
        await updateContact(message.data);
    };

export const textMessagesListener =
    (logger: Logger) =>
    async (
        senderDid: DIDString,
        originalMessage: EncapsulatedMessage<IMTextMessage>
    ) => {
        const message = originalMessage;
        try {
            const m = mapReceivedMessageToEnrichedMessage(message, senderDid);
            await saveMessageToDb(m, { status: "received" });
        } catch (e) {
            if (e instanceof Error) {
                if (
                    e.message.includes(
                        "UNIQUE constraint failed: messages.sha256"
                    )
                ) {
                    logger.debug("message already saved, skipping");
                } else {
                    logger.error(
                        "error saving message, error_message:",
                        e.message,
                        message
                    );
                }
            } else {
                logger.error("error saving message, error_object:", e);
            }
        }
    };

export const newProfilesMessagesListener =
    (selfDid: DIDDocument) =>
    async (_sender: DIDString, { data }: { data: SmashProfileList }) => {
        const contacts = await Promise.all(
            data.map(SmashProfileToContactMapper)
        );
        await Promise.all(
            contacts
                .filter((c: ContactInsert) => c.did_id !== selfDid.id)
                .map((c: ContactInsert) => saveContactToDb(c))
        );
    };

export const statusMessagesListener =
    (logger: Logger) => async (status: MessageStatus, messageIds: sha256[]) => {
        logger.debug("parsing status message", status, messageIds);
        await updateMessagesStatus(messageIds, status);
    };

export const mediaMessagesListener =
    (logger: Logger) =>
    async (senderDid: DIDString, originalMessage: IMMediaEmbeddedMessage) => {
        logger.debug("parsing media message from", senderDid, originalMessage);

        try {
            // Type guard to check message type and data
            if (
                !originalMessage.data ||
                typeof originalMessage.data !== "object"
            ) {
                throw new Error("Invalid media message data");
            }

            const mediaData = originalMessage.data;
            const mediaType = getMediaTypeFromMimeType(mediaData.mimeType);

            // Save media to storage and database
            const mediaMetadata = await saveMediaFromBase64(
                mediaData.content,
                mediaData.mimeType,
                mediaType,
                {
                    generateThumbnail: mediaType === "video",
                }
            );

            // Map the message to an enriched message with the saved media's SHA256
            const m = mapReceivedMessageToEnrichedMessage(
                {
                    ...originalMessage,
                    data: "",
                    sha256: mediaMetadata.sha256,
                    timestamp:
                        originalMessage.timestamp ?? new Date().toISOString(),
                } as EncapsulatedIMProtoMessage,
                senderDid
            );

            // Save the message to the database with "received" status
            await saveMessageToDb(m, { status: "received" });
        } catch (e) {
            if (e instanceof Error) {
                if (
                    e.message.includes(
                        "UNIQUE constraint failed: messages.sha256"
                    )
                ) {
                    logger.debug("message already saved, skipping");
                } else {
                    logger.error(
                        "error saving media message, error_message:",
                        e.message,
                        originalMessage
                    );
                }
            } else {
                logger.error("error saving media message, error_object:", e);
            }
        }
    };

export type EventType =
    | `${string}.${string}.${string}`
    | keyof MessagingEventMap;

export const handleUserMessages = async (user: SmashUser, logger: Logger) => {
    const selfDid = await user.getDIDDocument();

    const listeners: Partial<
        Record<EventType, (...args: any[]) => Promise<void>>
    > = {
        [SMASH_PROFILE_LIST]: newProfilesMessagesListener(selfDid),
        [IM_CHAT_TEXT]: textMessagesListener(logger),
        [IM_PROFILE]: profileMessagesListener(logger),
        [IM_MEDIA_EMBEDDED]: mediaMessagesListener(logger),
        status: statusMessagesListener(logger),
        data: firehoseListener(logger),
    };
    const unsubscribes: (() => void)[] = [];

    Object.entries(listeners).forEach(([key, value]) => {
        const type = key as EventType;
        if (value) {
            user.on(type, value);
            unsubscribes.push(() => user.removeListener(type, value));
        }
    });

    return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
};

export const createTextMessage = async (
    content: string,
    lastMessageId: sha256 | undefinedString
): Promise<IMProtoMessage> => {
    const message = await encapsulateMessage(
        new IMText(content, lastMessageId)
    );
    message.type = IM_CHAT_TEXT;
    return message;
};

export const createMediaMessage = async (
    asset: ImagePicker.ImagePickerAsset,
    mediaType: "image" | "video" | "audio",
    lastMessageId: sha256 | undefinedString
): Promise<{ message: IMProtoMessage; metadata: MediaMetadata }> => {
    const mediaMetadata = await saveMediaFromBase64(
        asset.base64!,
        asset.mimeType!,
        mediaType,
        {
            width: asset.width,
            height: asset.height,
            duration: asset.duration ?? undefined,
            generateThumbnail: mediaType === "video" || mediaType === "image",
        }
    );

    const message = IMMediaEmbedded.fromBase64(asset.base64!, asset.mimeType!);
    message.after = lastMessageId;

    const messageWithMetadata = {
        ...message,
        sha256: mediaMetadata.sha256 as sha256,
        timestamp: new Date().toISOString() as ISO8601,
    };

    return { message: messageWithMetadata, metadata: mediaMetadata };
};

export const getMessageData = (
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

export const saveMessageFromSelfToLocalDb = async (
    message: IMProtoMessage,
    selfDid: DIDString,
    toDiscussionId: DIDString,
    mediaMetadata?: MediaMetadata
): Promise<void> => {
    const { db_data } = getMessageData(message, mediaMetadata);

    const msg = {
        fromDid: selfDid,
        toDiscussionId,
        data: db_data,
        sha256: message.sha256 as sha256,
        timestamp: message.timestamp!,
        type: message.type,
        after: message.after as sha256,
    } satisfies EnrichedSmashMessage;

    await saveMessageToDb(msg, {
        date_read: new Date(),
    });
};

export const sendAudioMessage = async (
    audioMetadata: MediaMetadata,
    lastMessageId: sha256 | undefinedString,
    toDiscussionId: DIDString,
    sendMessage: (message: IMProtoMessage) => Promise<void>
): Promise<void> => {
    try {
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
            after: lastMessageId,
            sha256: audioMetadata.sha256 as sha256,
            timestamp: new Date().toISOString() as ISO8601,
        };

        await sendMessage(messageWithMetadata);
        await markContactAsActive(toDiscussionId);
    } catch (error) {
        console.error("Error sending audio message:", error);
        throw error;
    }
};
