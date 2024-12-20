import { DIDString, EncapsulatedIMProtoMessage, IM_CHAT_TEXT, IM_PROFILE, sha256 } from "@smashchats/library";
import { EnrichedSmashMessage } from "@/src/db/models/Messages";
import { ESMToMessageInsertMapper, mapReceivedMessageToEnrichedMessage } from "@/src/utils/mappers/messages";

describe("message mappers", () => {
    describe("mapReceivedMessageToEnrichedMessage", () => {
        it("maps received text message to enriched message", () => {
            const message: EncapsulatedIMProtoMessage = {
                type: IM_CHAT_TEXT,
                data: "Hello world",
                sha256: "abc123" as sha256,
                timestamp: "2024-01-01T00:00:00.000Z",
                after: "def456" as sha256
            };
            const senderDid = "did:123" as DIDString;

            const result = mapReceivedMessageToEnrichedMessage(message, senderDid);

            expect(result).toEqual({
                ...message,
                fromDid: senderDid,
                toDiscussionId: senderDid
            });
        });

        it("stringifies non-string data", () => {
            const message: EncapsulatedIMProtoMessage = {
                type: IM_CHAT_TEXT,
                data: { foo: "bar" },
                sha256: "abc123" as sha256,
                timestamp: "2024-01-01T00:00:00.000Z",
                after: "" as sha256
            };
            const senderDid = "did:123" as DIDString;

            const result = mapReceivedMessageToEnrichedMessage(message, senderDid);

            expect(result.data).toBe('{"foo":"bar"}');
        });
    });

    describe("ESMToMessageInsertMapper", () => {
        it("maps enriched text message to message insert", () => {
            const message: EnrichedSmashMessage = {
                type: IM_CHAT_TEXT,
                data: "Hello world",
                sha256: "abc123" as sha256,
                timestamp: "2024-01-01T00:00:00.000Z",
                fromDid: "did:123" as DIDString,
                toDiscussionId: "did:456" as DIDString,
                after: "def456" as sha256
            };

            const result = ESMToMessageInsertMapper(message);

            expect(result).toEqual({
                sha256: "abc123",
                from_did_id: "did:123",
                discussion_id: "did:456",
                timestamp: new Date("2024-01-01T00:00:00.000Z"),
                type: IM_CHAT_TEXT,
                data: "Hello world",
                after_sha256: "def456"
            });
        });

        it("stringifies data for non-text messages", () => {
            const message: EnrichedSmashMessage = {
                type: IM_CHAT_TEXT,
                data: { foo: "bar" },
                sha256: "abc123" as sha256,
                timestamp: "2024-01-01T00:00:00.000Z",
                fromDid: "did:123" as DIDString,
                toDiscussionId: "did:456" as DIDString,
                after: "0"
            };

            const result = ESMToMessageInsertMapper(message);

            expect(result.data).toStrictEqual({"foo":"bar"});
            expect(result.after_sha256).toBe("0");
        });

        it('throws error if message type is not IM_CHAT_TEXT', () => {
            const message: EnrichedSmashMessage = {
                type: IM_PROFILE,
            } as unknown as EnrichedSmashMessage;

            expect(() => ESMToMessageInsertMapper(message)).toThrow("Message type is not IM_CHAT_TEXT");
        });
    });
});
