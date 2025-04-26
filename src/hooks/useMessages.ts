import { useState, useCallback, useEffect } from "react";
import { eq, desc, and, sql } from "drizzle-orm";

import {
    DIDString,
    IM_CHAT_TEXT,
    IM_MEDIA_EMBEDDED,
    EncapsulatedIMProtoMessage,
    IMMediaEmbeddedMessage,
    MessageStatus,
    sha256,
    undefinedString,
    IMProtoMessage,
} from "@smashchats/library";

import { drizzle_db } from "@/src/db/database";
import { messages as MessagesSchema, media } from "@/src/db/schema";
import {
    Message,
    markAllMessagesNotFromSelfInDiscussionAsRead,
} from "@/src/db/models/Messages";
import {
    addSystemMessages,
    appendMessageToDisplayableMessages,
    appendOlderMessages,
} from "@/src/utils/MessagesUtils.js";
import { DisplayableMessage } from "@/src/types/";
import {
    useGlobalState,
    useGlobalDispatch,
} from "@/src/context/GlobalContext.js";
import { MediaMetadata } from "@/src/utils/MediaStorage";

const DEFAULT_LOAD_LIMIT = __DEV__ ? 10 : 100;

export const useMessages = (peerId: string, scrollToBottom?: () => void) => {
    const globalState = useGlobalState();
    const dispatch = useGlobalDispatch();
    const [messages, setMessages] = useState<DisplayableMessage[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasUserScrolledToOlderMessages, setHasUserScrolledToOlderMessages] =
        useState(false);

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

    // Load initial messages
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
                    `useMessages::useEffect::Latest message id in discussion ${peerId} set to ${lastMessageId}`
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
    }, [
        peerId,
        globalState.logger,
        dispatch,
        globalState.selfDid,
        globalState.selfDid?.id,
    ]);

    // Mark messages as read
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
                `useMessages::useEffect::Marked all messages in discussion ${peerId} as read`
            );
        });
    }, [
        peerId,
        globalState.logger,
        globalState.selfSmashUser,
        globalState.selfDid,
        globalState.selfDid?.id,
    ]);

    const appendMessage = ({
        data,
        sha256,
        after_sha256,
        from_self,
        type,
        media,
    }: {
        data: any;
        sha256: sha256;
        after_sha256: sha256 | undefinedString;
        from_self: boolean;
        type: string;
        media?: MediaMetadata;
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
                    media,
                } satisfies Message & { media?: MediaMetadata },
                messages,
                globalState.selfDid.id
            )
        );
    };

    // Handle new messages from peer
    useEffect(() => {
        const onNewMessageByPeer = (
            senderId: DIDString,
            originalMessage: IMProtoMessage
        ) => {
            const message = originalMessage as EncapsulatedIMProtoMessage;

            if (senderId === peerId) {
                markAllMessagesNotFromSelfInDiscussionAsRead(
                    peerId,
                    globalState.selfDid.id
                ).then(() => {
                    globalState.logger.debug(
                        `useMessages::onNewMessages::Marked received messages in discussion ${peerId} as read`
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

                let media_metadata: MediaMetadata | undefined;
                let displayable_data;

                if (message.type === IM_MEDIA_EMBEDDED) {
                    const [media_type, extension] = (
                        message as IMMediaEmbeddedMessage
                    ).data.mimeType.split("/");

                    media_metadata = {
                        ...(message as IMMediaEmbeddedMessage).data,
                        sha256: message.sha256,
                        file_path: `${message.sha256}.${extension}`,
                        mime_type: (message as IMMediaEmbeddedMessage).data
                            .mimeType,
                        media_type,
                    } as unknown as MediaMetadata;

                    if (media_type !== "audio") {
                        // TODO: find file URI for media messages instead of using base64
                        dispatch({
                            type: "ADD_SHOWN_MEDIA_IN_GALLERY_ACTION",
                            media: {
                                uri:
                                    "data:image/png;base64," +
                                    (message as IMMediaEmbeddedMessage).data
                                        .content,
                                id: message.sha256,
                                type: (
                                    message as IMMediaEmbeddedMessage
                                ).data.mimeType.split("/")[0] as
                                    | "image"
                                    | "video",
                            },
                        });

                        // TODO handle videos and video thumbnails
                        displayable_data =
                            "data:image/png;base64," +
                            (message as IMMediaEmbeddedMessage).data.content;
                    }
                } else {
                    displayable_data = message.data;
                }

                if (!hasUserScrolledToOlderMessages && scrollToBottom) {
                    scrollToBottom();
                }

                appendMessage({
                    data: displayable_data as string,
                    sha256: message.sha256,
                    after_sha256: message.after,
                    from_self: false,
                    type: message.type,
                    media: media_metadata,
                });
            }
        };

        // SUPPORT FOR NEW MESSAGE TYPES SHOULD BE ADDED HERE
        globalState.selfSmashUser?.on(IM_CHAT_TEXT, onNewMessageByPeer);
        globalState.selfSmashUser?.on(IM_MEDIA_EMBEDDED, onNewMessageByPeer);

        return () => {
            [IM_CHAT_TEXT, IM_MEDIA_EMBEDDED].forEach((type) => {
                globalState.selfSmashUser?.removeListener(
                    type,
                    onNewMessageByPeer
                );
            });
        };
    }, [
        globalState.selfSmashUser,
        messages,
        peerId,
        globalState.selfDid?.id,
        dispatch,
        hasUserScrolledToOlderMessages,
        globalState.logger,
        appendMessage,
        scrollToBottom,
    ]);

    // SUPPORT FOR NEW MESSAGE TYPES SHOULD BE ADDED HERE
    const keyExtractor = useCallback(
        (message: DisplayableMessage, index: number) => {
            switch (message.type) {
                case null:
                case undefined:
                    return `index-${index}`;
                case "system-date":
                case "system-unread":
                    return `${message.type}-${message.sha256}-index-${index}`;
                case IM_CHAT_TEXT:
                case IM_MEDIA_EMBEDDED:
                case "metadata":
                case "profile":
                case "profiles":
                default:
                    return `${message.type}-${message.sha256}`;
            }
        },
        []
    );

    return {
        messages,
        loadMoreMessages,
        keyExtractor,
        appendMessage,
        setHasUserScrolledToOlderMessages,
    };
};
