import { DIDString } from "@smashchats/library";

import { Message } from "@/src/db/models/Messages";
import {
    addSystemMessages,
    appendMessageToDisplayableMessages,
    appendOlderMessages,
} from "@/src/utils/MessagesUtils";

describe("MessagesUtils", () => {
    describe("addSystemMessages", () => {
        it("adds system date messages", () => {
            const message1 = {
                type: "chat-text 1",
                date_delivered: new Date("2024-01-01T00:00:00.000Z"),
                date_read: new Date("2024-01-01T00:00:00.000Z"),
                sha256: "sha256-1",
            } as Message;
            const message2 = {
                type: "chat-text 2",
                date_delivered: new Date("2024-01-03T00:00:00.000Z"),
                date_read: new Date("2024-01-03T00:00:00.000Z"),
                sha256: "sha256-2",
            } as Message;

            const db_messages: Message[] = [message2, message1];
            const result = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(4);

            expect(result[3]).toStrictEqual({
                type: "system-date",
                date: new Date("2024-01-01T00:00:00.000Z"),
                content: "2024-01-01",
                sha256: "2024-01-01T00:00:00.000Z",
                from: "system",
                fromMe: false,
            });

            expect(result[2].type).toBe("chat-text 1");

            expect(result[1]).toStrictEqual({
                type: "system-date",
                date: new Date("2024-01-03T00:00:00.000Z"),
                content: "2024-01-03",
                sha256: "2024-01-03T00:00:00.000Z",
                from: "system",
                fromMe: false,
            });

            expect(result[0].type).toBe("chat-text 2");
        });

        it("adds system dates only when date changes between messages", () => {
            const message1 = {
                type: "chat-text 3",
                date_delivered: new Date("2024-01-01T12:00:00.000Z"),
                date_read: new Date("2024-01-01T12:00:00.000Z"),
                sha256: "sha256-3",
            } as Message;
            const message2 = {
                type: "chat-text 4",
                date_delivered: new Date("2024-01-01T13:00:00.000Z"),
                date_read: new Date("2024-01-01T13:00:00.000Z"),
                sha256: "sha256-4",
            } as Message;
            const db_messages: Message[] = [message2, message1];

            const result = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(3);

            expect(result[2]).toStrictEqual({
                type: "system-date",
                date: new Date("2024-01-01T00:00:00.000Z"),
                content: "2024-01-01",
                sha256: "2024-01-01T12:00:00.000Z",
                from: "system",
                fromMe: false,
            });
            expect(result[1].type).toBe("chat-text 3");
            expect(result[0].type).toBe("chat-text 4");
        });

        it("adds system unread messages when all messages are unread", () => {
            const message1 = {
                type: "chat-text 5",
                date_delivered: new Date("2024-01-01T12:00:00.000Z"),
                sha256: "sha256-5",
            } as Message;
            const db_messages: Message[] = [message1];
            const result = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(3);
            expect(result[2].type).toBe("system-unread");
            expect(result[1].type).toBe("system-date");
            expect(result[0].type).toBe("chat-text 5");
        });

        it("adds system unread messages when there are unread messages", () => {
            const message1 = {
                type: "chat-text 5",
                date_delivered: new Date("2024-01-01T12:00:00.000Z"),
                date_read: new Date("2024-01-01T12:00:00.000Z"),
                sha256: "sha256-6",
            } as Message;
            const message2 = {
                type: "chat-text 6",
                date_delivered: new Date("2024-01-01T13:00:00.000Z"),
                sha256: "sha256-7",
            } as Message;
            const db_messages: Message[] = [message2, message1];
            const result = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(4);
            expect(result[3].type).toBe("system-date");
            expect(result[2].type).toBe("chat-text 5");
            expect(result[1].type).toBe("system-unread");
            expect(result[0].type).toBe("chat-text 6");
        });

        it("doesn't fail when there are no messages", () => {
            const result = addSystemMessages([], "did:smash:test" as DIDString);
            expect(result.length).toBe(0);
        });
    });

    describe("appending messages to already displayed messages", () => {
        it("appends a same-day message at the end of the list of messages", () => {
            const message1 = {
                type: "chat-text 7",
                date_delivered: new Date("2024-01-01T12:00:00.000Z"),
                date_read: new Date("2024-01-01T12:00:00.000Z"),
                sha256: "sha256-8",
            } as Message;
            const message2 = {
                type: "chat-text 8",
                date_delivered: new Date("2024-01-01T13:00:00.000Z"),
                sha256: "sha256-9",
            } as Message;
            const db_messages: Message[] = [message2, message1];
            const displayedMessages = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );

            const message3 = {
                type: "chat-text 9",
                date_delivered: new Date("2024-01-01T14:00:00.000Z"),
                sha256: "sha256-10",
            } as Message;

            const result = appendMessageToDisplayableMessages(
                message3,
                displayedMessages,
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(5);
            expect(result[4].type).toBe("system-date");
            expect(result[3].type).toBe("chat-text 7");
            expect(result[2].type).toBe("system-unread");
            expect(result[1].type).toBe("chat-text 8");
            expect(result[0].type).toBe("chat-text 9");
        });

        it("appends a different-day message to the list of messages", () => {
            const message1 = {
                type: "chat-text 10",
                date_delivered: new Date("2024-01-01T12:00:00.000Z"),
                date_read: new Date("2024-01-01T12:00:00.000Z"),
                sha256: "sha256-11",
            } as Message;
            const message2 = {
                type: "chat-text 11",
                date_delivered: new Date("2024-01-01T13:00:00.000Z"),
                sha256: "sha256-12",
            } as Message;
            const db_messages: Message[] = [message2, message1];
            const displayedMessages = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );

            const message3 = {
                type: "chat-text 12",
                date_delivered: new Date("2024-01-02T14:00:00.000Z"),
                sha256: "sha256-13",
            } as Message;

            const result = appendMessageToDisplayableMessages(
                message3,
                displayedMessages,
                "did:smash:test" as DIDString
            );

            expect(result.length).toBe(6);
            expect(result[5].type).toBe("system-date");
            expect(result[4].type).toBe("chat-text 10");
            expect(result[3].type).toBe("system-unread");
            expect(result[2].type).toBe("chat-text 11");
            expect(result[1].type).toBe("system-date");
            expect(result[0].type).toBe("chat-text 12");
        });

        it("appends a date and message at the beginning of the list of messages", () => {
            const message = {
                type: "chat-text 15",
                date_delivered: new Date("2024-01-01T10:00:00.000Z"),
                sha256: "sha256-14",
            } as Message;

            const result = appendMessageToDisplayableMessages(
                message,
                [],
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(2);
            expect(result[1].type).toBe("system-date");
            expect(result[0].type).toBe("chat-text 15");
        });

        it("appends several same-day old messages at the beginning of the list of messages", () => {
            const message3 = {
                type: "chat-text 15",
                date_delivered: new Date("2024-01-01T12:00:00.000Z"),
                date_read: new Date("2024-01-01T12:00:00.000Z"),
                sha256: "sha256-15",
            } as Message;
            const message4 = {
                type: "chat-text 16",
                date_delivered: new Date("2024-01-01T13:00:00.000Z"),
                date_read: new Date("2024-01-01T13:00:00.000Z"),
                sha256: "sha256-16",
            } as Message;
            const db_messages: Message[] = [message4, message3];
            const displayedMessages = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );

            const message1 = {
                type: "chat-text 13",
                date_delivered: new Date("2024-01-01T10:00:00.000Z"),
                date_read: new Date("2024-01-01T10:00:00.000Z"),
                sha256: "sha256-17",
            } as Message;
            const message2 = {
                type: "chat-text 14",
                date_delivered: new Date("2024-01-01T11:00:00.000Z"),
                date_read: new Date("2024-01-01T11:00:00.000Z"),
                sha256: "sha256-18",
            } as Message;

            const result = appendOlderMessages(
                [message2, message1],
                displayedMessages,
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(5);
            expect(result[4].type).toBe("system-date");
            expect(result[3].type).toBe("chat-text 13");
            expect(result[2].type).toBe("chat-text 14");
            expect(result[1].type).toBe("chat-text 15");
            expect(result[0].type).toBe("chat-text 16");
        });

        it("appends several different-day old messages at the beginning of the list of messages", () => {
            const message3 = {
                type: "chat-text 19",
                date_delivered: new Date("2024-01-03T12:00:00.000Z"),
                date_read: new Date("2024-01-01T12:00:00.000Z"),
                sha256: "sha256-19",
            } as Message;
            const message4 = {
                type: "chat-text 20",
                date_delivered: new Date("2024-01-03T13:00:00.000Z"),
                date_read: new Date("2024-01-01T13:00:00.000Z"),
                sha256: "sha256-20",
            } as Message;
            const db_messages: Message[] = [message4, message3];
            const displayedMessages = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );

            const message1 = {
                type: "chat-text 17",
                date_delivered: new Date("2024-01-01T14:00:00.000Z"),
                date_read: new Date("2024-01-01T14:00:00.000Z"),
                sha256: "sha256-21",
            } as Message;
            const message2 = {
                type: "chat-text 18",
                date_delivered: new Date("2024-01-02T15:00:00.000Z"),
                date_read: new Date("2024-01-02T15:00:00.000Z"),
                sha256: "sha256-22",
            } as Message;

            const result = appendOlderMessages(
                [message2, message1],
                displayedMessages,
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(7);
            expect(result[6].type).toBe("system-date");
            expect(result[5].type).toBe("chat-text 17");
            expect(result[4].type).toBe("system-date");
            expect(result[3].type).toBe("chat-text 18");
            expect(result[2].type).toBe("system-date");
            expect(result[1].type).toBe("chat-text 19");
            expect(result[0].type).toBe("chat-text 20");
        });

        it('removes "unread" messages from original list and appends it where necessary when appending several different-day old messages at the beginning of the list of messages', () => {
            const originalMessage = {
                type: "chat-text 24",
                date_delivered: new Date("2024-01-03T12:00:00.000Z"),
                sha256: "sha256-23",
            } as Message;
            const db_messages: Message[] = [originalMessage];
            const displayedMessages = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );

            expect(displayedMessages.length).toBe(3);

            const message1 = {
                type: "chat-text 21",
                date_delivered: new Date("2024-01-01T14:00:00.000Z"),
                sha256: "sha256-24",
            } as Message;
            const message2 = {
                type: "chat-text 22",
                date_delivered: new Date("2024-01-02T15:00:00.000Z"),
                date_read: new Date("2024-01-02T15:00:00.000Z"),
                sha256: "sha256-25",
            } as Message;
            const message3 = {
                type: "chat-text 23",
                date_delivered: new Date("2024-01-02T16:00:00.000Z"),
                date_read: new Date("2024-01-03T16:00:00.000Z"),
                sha256: "sha256-26",
            } as Message;

            const result = appendOlderMessages(
                [message3, message2, message1],
                displayedMessages,
                "did:smash:test" as DIDString
            );

            expect(result.length).toBe(8);
            expect(result[7].type).toBe("system-unread");
            expect(result[7].content).toBe(2);
            expect(result[6].type).toBe("system-date");
            expect(result[5].type).toBe("chat-text 21");
            expect(result[4].type).toBe("system-date");
            expect(result[3].type).toBe("chat-text 22");
            expect(result[2].type).toBe("chat-text 23");
            expect(result[1].type).toBe("system-date");
            expect(result[0].type).toBe("chat-text 24");
        });

        it("appends an empty array when there are no messages to append", () => {
            const message1 = {
                type: "chat-text 21",
                date_delivered: new Date("2024-01-01T12:00:00.000Z"),
                date_read: new Date("2024-01-01T12:00:00.000Z"),
                sha256: "sha256-27",
            } as Message;
            const message2 = {
                type: "chat-text 22",
                date_delivered: new Date("2024-01-01T13:00:00.000Z"),
                date_read: new Date("2024-01-01T13:00:00.000Z"),
                sha256: "sha256-28",
            } as Message;
            const db_messages: Message[] = [message2, message1];
            const displayedMessages = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );
            const result = appendOlderMessages(
                [],
                displayedMessages,
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(3);
        });

        it("doesn't append a message with an already existing sha256 id", () => {
            const message1 = {
                type: "chat-text 21",
                date_delivered: new Date("2024-01-01T12:00:00.000Z"),
                date_read: new Date("2024-01-01T12:00:00.000Z"),
                sha256: "sha256-1",
            } as Message;
            const message2 = {
                type: "chat-text 22",
                date_delivered: new Date("2024-01-01T13:00:00.000Z"),
                date_read: new Date("2024-01-01T13:00:00.000Z"),
                sha256: "sha256-2",
            } as Message;
            const db_messages: Message[] = [message2, message1];
            const displayedMessages = addSystemMessages(
                db_messages,
                "did:smash:test" as DIDString
            );
            const result = appendOlderMessages(
                [message2, message1],
                displayedMessages,
                "did:smash:test" as DIDString
            );
            expect(result.length).toBe(3);
            expect(result[1].sha256).toBe("sha256-1");
            expect(result[0].sha256).toBe("sha256-2");  
        });
    });
});
