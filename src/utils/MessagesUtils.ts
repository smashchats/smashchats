import { DIDString, IM_MEDIA_EMBEDDED } from "@smashchats/library";

import { Message } from "@/src/db/models/Messages";
import { DisplayableMessage, DisplayableSystemMessage } from "@/src/types/";
import { MediaMetadata } from "@/src/utils/MediaStorage";

// Types
type SystemMessageType = "system-date" | "system-unread";

interface SystemMessageGenerator<T extends string | number> {
    type: SystemMessageType;
    generate: (date: Date, content: T) => DisplayableSystemMessage;
}

// Date utilities
const getDateString = (date: Date): string =>
    date.toISOString().substring(0, 10);

export const isSameDay = (date1: Date, date2: Date): boolean => {
    return getDateString(date1) === getDateString(date2);
};

const getMessageDate = (message: Message): Date => {
    return new Date(message.date_delivered ?? message.created_at);
};

// System message generators
const systemMessageGenerators: {
    "system-date": SystemMessageGenerator<string>;
    "system-unread": SystemMessageGenerator<number>;
} = {
    "system-date": {
        type: "system-date",
        generate: (date: Date, content: string) => ({
            type: "system-date",
            date: new Date(getDateString(date)),
            content,
            sha256: date.toISOString(),
            from: "system",
            fromMe: false,
        }),
    },
    "system-unread": {
        type: "system-unread",
        generate: (date: Date, content: number) => ({
            type: "system-unread",
            date: new Date(getDateString(date)),
            content,
            sha256: date.toISOString(),
            from: "system",
            fromMe: false,
        }),
    },
};

// Message mapping
export const mapMessageToDisplayableMessage = (
    message: Message & { media?: MediaMetadata },
    selfDidString: DIDString
): DisplayableMessage => {
    let content = "";

    if (message.type === IM_MEDIA_EMBEDDED) {
        content = message.media?.file_path ?? message.data;
    } else {
        content = message.data;
    }

    return {
        ...message,
        date: getMessageDate(message),
        content,
        media: message.media,
        from: message.from_did_id,
        fromMe: message.from_did_id === selfDidString,
    };
};

// System message handling
const getUnreadMessageCount = (messages: Message[]): number => {
    return messages.filter((m) => !m.date_read).length;
};

const getExistingUnreadCount = (messages: DisplayableMessage[]): number => {
    const unreadMessage = messages.find(
        (m): m is DisplayableSystemMessage => m.type === "system-unread"
    );
    return (unreadMessage?.content as number) ?? 0;
};

export const addSystemMessages = (
    db_messages: Message[],
    selfDidString: DIDString,
    alreadyDisplayedUnreadMessages: number = 0
): DisplayableMessage[] => {
    const newMessages: DisplayableMessage[] = [];
    let previousDate = new Date(0);
    const messages = db_messages.toReversed();

    const unreadMessages = getUnreadMessageCount(messages);
    let hasAddedUnreadMessagesMessage = unreadMessages === 0;

    messages.forEach((message) => {
        const msgDate = getMessageDate(message);

        if (!hasAddedUnreadMessagesMessage && !message.date_read) {
            newMessages.push(
                systemMessageGenerators["system-unread"].generate(
                    msgDate,
                    unreadMessages + alreadyDisplayedUnreadMessages
                )
            );
            hasAddedUnreadMessagesMessage = true;
        }

        if (!isSameDay(msgDate, previousDate)) {
            newMessages.push(
                systemMessageGenerators["system-date"].generate(
                    msgDate,
                    getDateString(msgDate)
                )
            );
            previousDate = msgDate;
        }

        newMessages.push(
            mapMessageToDisplayableMessage(message, selfDidString)
        );
    });

    return newMessages.toReversed();
};

export const appendMessageToDisplayableMessages = (
    db_message: Message & { media?: MediaMetadata },
    displayedMessages: DisplayableMessage[],
    selfDidString: DIDString
): DisplayableMessage[] => {
    const latestMessage = displayedMessages[0];
    const msgDate = getMessageDate(db_message);

    if (!latestMessage || !isSameDay(latestMessage.date, msgDate)) {
        return [
            mapMessageToDisplayableMessage(db_message, selfDidString),
            systemMessageGenerators["system-date"].generate(
                msgDate,
                getDateString(msgDate)
            ),
            ...displayedMessages,
        ];
    }

    return [
        mapMessageToDisplayableMessage(db_message, selfDidString),
        ...displayedMessages,
    ];
};

// Message deduplication
const getExistingMessageIds = (messages: DisplayableMessage[]): Set<string> => {
    return new Set(messages.map((m) => m.sha256));
};

export const appendOlderMessages = (
    db_messages: Message[],
    displayedMessages: DisplayableMessage[],
    selfDidString: DIDString
): DisplayableMessage[] => {
    if (db_messages.length === 0) {
        return displayedMessages ?? [];
    }

    const existingMessageIds = getExistingMessageIds(displayedMessages);
    const uniqueDbMessages = db_messages.filter(
        (msg) => !existingMessageIds.has(msg.sha256)
    );

    if (uniqueDbMessages.length === 0) {
        return displayedMessages;
    }

    const lastMessage = displayedMessages[displayedMessages.length - 1];
    const alreadyDisplayedUnreadMessages =
        getExistingUnreadCount(displayedMessages);

    const newMessages = addSystemMessages(
        uniqueDbMessages,
        selfDidString,
        alreadyDisplayedUnreadMessages
    );

    const newUnreadMessages = getExistingUnreadCount(newMessages);
    const lastTwoMessages = displayedMessages
        .slice(-2)
        .filter((m) => m.type !== "system-date");

    const firstNewMessageDate = getMessageDate(uniqueDbMessages[0]);

    if (newUnreadMessages > 0) {
        return [
            ...displayedMessages.filter((m) => m.type !== "system-unread"),
            ...newMessages,
        ];
    }

    if (!isSameDay(lastMessage.date, firstNewMessageDate)) {
        return [...displayedMessages, ...newMessages];
    }

    return [
        ...displayedMessages.slice(0, -2),
        ...lastTwoMessages,
        ...newMessages,
    ];
};
