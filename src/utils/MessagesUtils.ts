import { DIDString } from "@smashchats/library";

import { Message } from "@/src/db/models/Messages";
import { DisplayableMessage, DisplayableSystemMessage } from "@/src/types/";

const generateSystemDateMessage = (date: Date) => {
    const dateString = date.toISOString().substring(0, 10);
    return {
        type: "system-date",
        date: new Date(dateString),
        content: dateString,
        sha256: date.toISOString(),
        from: "system",
        fromMe: false,
    } satisfies DisplayableSystemMessage;
}

const generateSystemUnreadMessage = (date: Date, unreadMessages: number) => {
    const dateString = date.toISOString().substring(0, 10);
    return {
        type: "system-unread",
        date: new Date(dateString),
        content: unreadMessages,
        sha256: date.toISOString(),
        from: "system",
        fromMe: false,
    } satisfies DisplayableSystemMessage;
}

export const mapMessageToDisplayableMessage = (message: Message, selfDidString: DIDString): DisplayableMessage => {
    return {
        ...message,
        date: new Date(message.date_delivered ?? message.created_at),
        content: message.data,
        from: message.from_did_id,
        fromMe: message.from_did_id === selfDidString,
    };
};

export const isSameDay = (date1: Date, date2: Date) => {
    return date1.toISOString().substring(0, 10) === date2.toISOString().substring(0, 10);
}

export const addSystemMessages = (db_messages: Message[], selfDidString: DIDString, alreadyDisplayedUnreadMessages: number = 0): DisplayableMessage[] => {
    const newMessages: DisplayableMessage[] = [];
    let previousDate = new Date(0);

    const messages = db_messages.toReversed();

    let unreadMessages = messages.filter(m => !m.date_read).length;
    let hasAddedUnreadMessagesMessage = unreadMessages === 0;

    messages.forEach((message) => {
        if (!hasAddedUnreadMessagesMessage && !message.date_read) {
            newMessages.push(generateSystemUnreadMessage(message.date_delivered ?? message.created_at, unreadMessages + alreadyDisplayedUnreadMessages));
            hasAddedUnreadMessagesMessage = true;
        }
        const msgDate = (message.date_delivered ?? message.created_at);
        if (!isSameDay(msgDate, previousDate)) {
            newMessages.push(generateSystemDateMessage(msgDate));
            previousDate = msgDate;
        }
        newMessages.push(mapMessageToDisplayableMessage(message, selfDidString));
    });
    return newMessages.toReversed();
};

export const appendMessageToDisplayableMessages = (db_message: Message, displayedMessages: DisplayableMessage[], selfDidString: DIDString): DisplayableMessage[] => {
    const latestMessage = displayedMessages[0];

    if (!latestMessage || !isSameDay(latestMessage.date, db_message.date_delivered ?? db_message.created_at)) {
        return [
            mapMessageToDisplayableMessage(db_message, selfDidString),
            generateSystemDateMessage(db_message.date_delivered ?? db_message.created_at),
            ...displayedMessages,
        ];
    }
    return [
        mapMessageToDisplayableMessage(db_message, selfDidString),
        ...displayedMessages,
    ];
}

export const appendOlderMessages = (db_messages: Message[], displayedMessages: DisplayableMessage[], selfDidString: DIDString): DisplayableMessage[] => {
    if (db_messages.length === 0) {
        return displayedMessages ?? [];
    }
    const lastMessage = displayedMessages[displayedMessages.length - 1];

    const existingSystemMessages = displayedMessages.filter(m => m.type.startsWith("system-"));
    const alreadyDisplayedUnreadMessages: number = (existingSystemMessages.find(m => m.type === "system-unread") as DisplayableSystemMessage | undefined)?.content as number | undefined ?? 0;

    const newMessages = addSystemMessages(db_messages, selfDidString, alreadyDisplayedUnreadMessages);
    const newUnreadMessages: number = (newMessages.find(m => m.type === "system-unread") as DisplayableSystemMessage | undefined)?.content as number | undefined ?? 0;

    const lastTwoMessages = displayedMessages.slice(-2).filter(m => m.type !== "system-date");

    const thereAreUnreadMessagesInTheNewlyLoadedOldMessages = newUnreadMessages > 0;

    if (thereAreUnreadMessagesInTheNewlyLoadedOldMessages) {
        return [
            ...displayedMessages.filter(m => m.type !== "system-unread"),
            ...newMessages,
        ];
    } else if (!isSameDay(lastMessage.date, db_messages[0].date_delivered ?? db_messages[0].created_at)) {
        return [
            ...displayedMessages,
            ...newMessages,
        ];
    } else {
        return [
            ...displayedMessages.slice(0, -2),
            ...lastTwoMessages,
            ...newMessages,
        ];
    }
}
