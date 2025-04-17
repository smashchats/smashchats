import { IM_CHAT_TEXT, IM_MEDIA_EMBEDDED } from "@smashchats/library";
import {
    createTextMessage,
    createMediaMessage,
    saveMessageFromSelfToLocalDb,
    sendAudioMessage,
} from "@/src/utils/messageHandlers";
import { MediaMetadata } from "@/src/utils/MediaStorage";
import * as MediaStorage from "@/src/utils/MediaStorage";
import * as Messages from "@/src/db/models/Messages";
import * as Contacts from "@/src/db/models/Contacts";

jest.mock("@/src/utils/MediaStorage", () => ({
    saveMediaFromBase64: jest.fn(),
    getMediaTypeFromMimeType: jest.fn(),
    getMediaBytes: jest.fn(),
}));

jest.mock("@/src/db/models/Messages", () => ({
    saveMessageToDb: jest.fn(),
}));

jest.mock("@/src/db/models/Contacts", () => ({
    markContactAsActive: jest.fn(),
}));

jest.mock("@smashchats/library", () => {
    const originalModule = jest.requireActual("@smashchats/library");
    return {
        ...originalModule,
        encapsulateMessage: jest.fn((message) => ({
            ...message,
            sha256: "test-sha256",
            timestamp: "2023-01-01T00:00:00Z",
        })),
        IMMediaEmbedded: {
            fromBase64: jest.fn((content, mimeType) => ({
                type: "media",
                data: { content, mimeType },
                after: "previous-message-id",
            })),
        },
    };
});

describe("messageHandlers", () => {
    const mockFromDid = "self-did-id" as any;
    const mockToDiscussionId = "peer-did-id" as any;
    const mockLastMessageId = "previous-message-id" as any;
    const mockSendMessage = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createTextMessage", () => {
        it("should create a text message with the correct content and lastMessageId", async () => {
            const content = "Hello world";

            const message = await createTextMessage(content, mockLastMessageId);

            expect(message.type).toBe(IM_CHAT_TEXT);
            expect(message.data).toBe(content);
            expect(message.after).toBe(mockLastMessageId);
            expect(message.sha256).toBe("test-sha256");
        });
    });

    describe("createMediaMessage", () => {
        it("should create a media message with the correct metadata", async () => {
            const mockAsset = {
                base64: "base64-content",
                mimeType: "image/jpeg",
                width: 100,
                height: 100,
                duration: 5,
            };

            const mockMediaMetadata = {
                file_path: "test-file-path",
                sha256: "media-sha256",
                mime_type: "image/jpeg",
            };

            (MediaStorage.saveMediaFromBase64 as jest.Mock).mockResolvedValue(
                mockMediaMetadata
            );
            (
                MediaStorage.getMediaTypeFromMimeType as jest.Mock
            ).mockReturnValue("image");

            const { message, metadata } = await createMediaMessage(
                mockAsset as any,
                "image",
                mockLastMessageId
            );

            expect(MediaStorage.saveMediaFromBase64).toHaveBeenCalledWith(
                "base64-content",
                "image/jpeg",
                "image",
                {
                    width: 100,
                    height: 100,
                    duration: 5,
                    generateThumbnail: true,
                }
            );

            expect(message.type).toBe("media");
            expect(message.after).toBe(mockLastMessageId);
            expect(message.sha256).toBe("media-sha256");
            expect(metadata).toBe(mockMediaMetadata);
        });
    });

    describe("saveMessageFromSelfToLocalDb", () => {
        it("should save a text message to the database", async () => {
            const mockMessage = {
                type: IM_CHAT_TEXT,
                data: "Hello world",
                sha256: "test-sha256",
                after: mockLastMessageId,
                timestamp: "2023-01-01T00:00:00Z",
            };

            await saveMessageFromSelfToLocalDb(
                mockMessage as any,
                mockFromDid,
                mockToDiscussionId
            );

            expect(Messages.saveMessageToDb).toHaveBeenCalledWith(
                {
                    fromDid: mockFromDid,
                    toDiscussionId: mockToDiscussionId,
                    data: "Hello world",
                    sha256: "test-sha256",
                    timestamp: "2023-01-01T00:00:00Z",
                    type: IM_CHAT_TEXT,
                    after: mockLastMessageId,
                },
                {
                    date_read: expect.any(Date),
                }
            );
        });

        it("should save a media message to the database with media metadata", async () => {
            const mockMessage = {
                type: IM_MEDIA_EMBEDDED,
                data: "",
                sha256: "test-sha256",
                after: mockLastMessageId,
                timestamp: "2023-01-01T00:00:00Z",
            };

            const mockMediaMetadata: MediaMetadata = {
                file_path: "test-file-path",
                sha256: "media-sha256",
                mime_type: "image/jpeg",
                media_type: "image",
                size: 100,
            };

            await saveMessageFromSelfToLocalDb(
                mockMessage as any,
                mockFromDid,
                mockToDiscussionId,
                mockMediaMetadata
            );

            expect(Messages.saveMessageToDb).toHaveBeenCalledWith(
                {
                    fromDid: mockFromDid,
                    toDiscussionId: mockToDiscussionId,
                    data: "",
                    sha256: "test-sha256",
                    timestamp: "2023-01-01T00:00:00Z",
                    type: IM_MEDIA_EMBEDDED,
                    after: mockLastMessageId,
                },
                {
                    date_read: expect.any(Date),
                }
            );
        });
    });

    describe("sendAudioMessage", () => {
        it("should send an audio message with the correct metadata", async () => {
            const mockAudioMetadata: MediaMetadata = {
                file_path: "test-audio-path",
                sha256: "audio-sha256",
                mime_type: "audio/m4a",
                media_type: "audio",
                size: 100,
            };

            const mockMediaBytes = "audio-bytes";

            (MediaStorage.getMediaBytes as jest.Mock).mockResolvedValue(
                mockMediaBytes
            );

            await sendAudioMessage(
                mockAudioMetadata,
                mockLastMessageId,
                mockToDiscussionId,
                mockSendMessage
            );

            expect(MediaStorage.getMediaBytes).toHaveBeenCalledWith(
                "test-audio-path"
            );
            expect(mockSendMessage).toHaveBeenCalledWith(
                {
                    type: "media",
                    data: { content: "audio-bytes", mimeType: "audio/m4a" },
                    after: mockLastMessageId,
                    sha256: "audio-sha256",
                    timestamp: expect.any(String),
                },
                {
                    sha256: "audio-sha256",
                    file_path: "test-audio-path",
                    mime_type: "audio/m4a",
                    media_type: "audio",
                    size: 100,
                }
            );
            expect(Contacts.markContactAsActive).toHaveBeenCalledWith(
                mockToDiscussionId
            );
        });

        it("should throw an error if media bytes cannot be retrieved", async () => {
            const mockAudioMetadata: MediaMetadata = {
                file_path: "test-audio-path",
                sha256: "audio-sha256",
                mime_type: "audio/m4a",
                media_type: "audio",
                size: 100,
            };

            (MediaStorage.getMediaBytes as jest.Mock).mockResolvedValue(null);

            await expect(
                sendAudioMessage(
                    mockAudioMetadata,
                    mockLastMessageId,
                    mockToDiscussionId,
                    mockSendMessage
                )
            ).rejects.toThrow("Failed to get media bytes");

            expect(mockSendMessage).not.toHaveBeenCalled();
        });
    });
});
