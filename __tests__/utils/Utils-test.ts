import { Message } from "@/src/app/profile/[user]/(tabs)/messages";
import {
    addSystemDateMessages,
    convertImageToBase64,
    DAY,
    daysBetweenTwoDates,
    getDidFromDomain,
    HOUR,
    MINUTE,
    SECOND
} from "@/src/utils/Utils";

import * as FileSystem from "expo-file-system";
import { readAsStringAsync } from "expo-file-system";

jest.mock('expo-file-system', () => ({
    readAsStringAsync: jest.fn(),
    EncodingType: {
        Base64: "base64"
    }
}));

beforeEach(() => {
    (readAsStringAsync as jest.Mock).mockClear();

});

describe("Utils", () => {
    describe("time", () => {
        test("units are correct", () => {
            expect(DAY).toBe(24 * HOUR);
            expect(HOUR).toBe(60 * MINUTE);
            expect(MINUTE).toBe(60 * SECOND);
            expect(SECOND).toBe(1000);
        });

        describe("diffInDays", () => {
            it("returns 1 for 1 day difference", () => {
                const dateStart = new Date("2024-02-29");
                const dateEnd = new Date("2024-03-01");
                expect(daysBetweenTwoDates(dateStart, dateEnd)).toBe(1);
            });

            it("returns 0 for same day", () => {
                const dateStart = new Date("2024-02-29");
                const dateEnd = new Date("2024-02-29");
                expect(daysBetweenTwoDates(dateStart, dateEnd)).toBe(0);
            });

            it("returns 1 for 1 day difference in reverse", () => {
                const dateStart = new Date("2024-03-01");
                const dateEnd = new Date("2024-02-29");
                expect(daysBetweenTwoDates(dateStart, dateEnd)).toBe(1);
            });

            it("returns 1 for yesterday midnight", () => {
                const dateEnd = new Date("2024-02-29");
                const dateStart = new Date(
                    `${new Date(dateEnd.getTime() - 1 * DAY).toDateString()} 23:59:00Z`
                );
                expect(daysBetweenTwoDates(dateStart, dateEnd)).toBe(1);
            });
        });
    });

    describe("getDidFromDomain", () => {
        beforeEach(() => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            Status: 0,
                            Answer: [
                                {
                                    name: "_smash.smash.chat",
                                    type: 16,
                                    data: {
                                        id: "did:smash:test",
                                        ik: "test-ik",
                                        ek: "test-ek",
                                        signature: "test-signature",
                                        endpoints: []
                                    }
                                }
                            ]
                        })
                })
            ) as jest.Mock;
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it("returns the DIDDocument for a given domain", async () => {
            const didDocument = await getDidFromDomain("smash.chat");
            expect(didDocument).toStrictEqual({
                id: "did:smash:test",
                ik: "test-ik",
                ek: "test-ek",
                signature: "test-signature",
                endpoints: []
            });

            expect(global.fetch).toHaveBeenCalledWith("https://dns.google/resolve?name=_smash.smash.chat&type=TXT", {
                headers: { "Content-Type": "application/dns-json" }
            });
        });
    });

    describe("addSystemDateMessages", () => {
        it("adds system date messages", () => {
            const message1 = { type: "chat-text 1", date: new Date("2024-01-01T00:00:00.000Z") } as Message;
            const message2 = { type: "chat-text 2", date: new Date("2024-01-03T00:00:00.000Z") } as Message;
            const messages: Message[] = [
                message1, message2
            ];
            const result = addSystemDateMessages(messages);
            expect(result.length).toBe(4);

            expect(result[0]).toStrictEqual({
                type: "system-date",
                date: new Date("2024-01-01T00:00:00.000Z"),
                content: "2024-01-01",
                sha256: "2024-01-01T00:00:00.000Z",
                from: "system",
                fromMe: false
            });

            expect(result[1]).toStrictEqual(message1);

            expect(result[2]).toStrictEqual({
                type: "system-date",
                date: new Date("2024-01-03T00:00:00.000Z"),
                content: "2024-01-03",
                sha256: "2024-01-03T00:00:00.000Z",
                from: "system",
                fromMe: false
            });

            expect(result[3]).toStrictEqual(message2);
        });

        it("adds system dates only when date changes between messages", () => {
            const message1 = { type: "chat-text 3", date: new Date("2024-01-01T12:00:00.000Z") } as Message;
            const message2 = { type: "chat-text 4", date: new Date("2024-01-01T13:00:00.000Z") } as Message;
            const messages: Message[] = [
                message1, message2
            ];

            const result = addSystemDateMessages(messages);
            expect(result.length).toBe(3);

            expect(result[0]).toStrictEqual({
                type: "system-date",
                date: new Date("2024-01-01T00:00:00.000Z"),
                content: "2024-01-01",
                sha256: "2024-01-01T12:00:00.000Z",
                from: "system",
                fromMe: false
            });
            expect(result[1]).toStrictEqual(message1);
            expect(result[2]).toStrictEqual(message2);
        })
    });

    describe("convertImageToBase64", () => {
        beforeEach(() => {
            jest.spyOn(FileSystem, "readAsStringAsync").mockResolvedValue("test-base64-data");
        });
        it("returns the base64 data of an image", async () => {
            const base64Data = await convertImageToBase64("test.png");

            expect(readAsStringAsync).toHaveBeenCalledWith("test.png", {
                encoding: FileSystem.EncodingType.Base64,
            });

            expect(base64Data).toBe("test-base64-data");

        })
    })
});
