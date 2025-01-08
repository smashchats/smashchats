import {
    DIDDocument,
    DIDString,
    EncapsulatedIMProtoMessage,
    IMProfileMessage,
    IM_CHAT_TEXT,
    IM_PROFILE,
    ISO8601,
    Logger,
    SMASH_PROFILE_LIST,
    SmashChatProfileListMessage,
    SmashUser,
    sha256,
} from "@smashchats/library";

import { ContactInsert, saveContactToDb, updateContact } from "@/src/db/models/Contacts";
import * as DbModelMessages from "@/src/db/models/Messages";
import { saveMessageToDb } from "@/src/db/models/Messages";
import { EnrichedSmashMessage } from "@/src/types/";
import {
    handleUserMessages,
    newProfilesMessagesListener,
    profileMessagesListener,
    textMessagesListener,
} from "@/src/utils/IdentityUtils";


jest.mock("@/src/db/models/Contacts", () => ({
    saveContactToDb: jest.fn(),
    updateContact: jest.fn(),
}));

jest.mock("@/src/db/models/Messages", () => ({
    saveMessageToDb: jest.fn(),
}));

describe("listeners", () => {
    const EVENT_TYPES = [IM_CHAT_TEXT, IM_PROFILE, SMASH_PROFILE_LIST];

    let logger: Logger;
    let user: SmashUser;

    const selfDid = { id: "did:smash:self" } as unknown as DIDDocument;
    const peerDid = { id: "did:smash:peer" } as unknown as DIDDocument;

    beforeEach(() => {
        jest.clearAllMocks();

        logger = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        } as unknown as Logger;

        user = {
            on: jest.fn(),
            getDIDDocument: jest.fn(),
            removeListener: jest.fn(),
        } as unknown as SmashUser;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    EVENT_TYPES.forEach((t) => {
        it(`sets a listener for ${t}`, async () => {
            const unsubscribe = await handleUserMessages(user, logger);

            expect(user.on).toHaveBeenCalledWith(t, expect.anything());

            unsubscribe();

            expect(user.removeListener).toHaveBeenCalled();
        });
    });

    describe("newProfilesMessagesListener", () => {
        it("saves new profiles to the database", async () => {
            const listener = newProfilesMessagesListener(selfDid);

            const message: SmashChatProfileListMessage = {
                data: [{ did: peerDid }],
                type: SMASH_PROFILE_LIST,
                after: "0",
            };

            await listener(peerDid.id, message);
            const contact = {
                did_id: peerDid.id,
                did_ik: undefined,
                did_ek: undefined,
                did_signature: undefined,
                did_endpoints: [],
                meta_title: undefined,
                meta_description: undefined,
                meta_avatar: undefined,
            } satisfies ContactInsert;

            expect(saveContactToDb).toHaveBeenCalledWith(contact);
        });
    });

    describe("textMessagesListener", () => {
        let listener: (
            senderDid: DIDString,
            message: EncapsulatedIMProtoMessage
        ) => Promise<void>;
        beforeEach(() => {
            jest.clearAllMocks();
            listener = textMessagesListener(logger);
        });

        it("saves text messages to the database", async () => {
            const message: EncapsulatedIMProtoMessage = {
                data: { text: "Hello, world!" },
                type: IM_CHAT_TEXT,
                after: "0",
                sha256: "sha256" as sha256,
                timestamp: new Date().toISOString() as ISO8601,
            };

            await listener(peerDid.id, message);

            const enrichedMessage: EnrichedSmashMessage = {
                ...message,
                fromDid: peerDid.id,
                toDiscussionId: peerDid.id,
                data: JSON.stringify(message.data),
            };

            expect(saveMessageToDb).toHaveBeenCalledWith(enrichedMessage);
        });

        it("doesn't throw if message is already saved", async () => {
            jest.spyOn(DbModelMessages, "saveMessageToDb").mockRejectedValue(
                new Error("UNIQUE constraint failed: messages.sha256")
            );

            const message: EncapsulatedIMProtoMessage = {
                data: { text: "Hello, world!" },
                type: IM_CHAT_TEXT,
                after: "0",
                sha256: "sha256" as sha256,
                timestamp: new Date().toISOString() as ISO8601,
            };

            expect(
                async () => await listener(peerDid.id, message)
            ).not.toThrow();
            expect(logger.error).not.toHaveBeenCalled();
        });

        it("logs error if message is not text", async () => {
            jest.spyOn(DbModelMessages, "saveMessageToDb").mockRejectedValue(
                new Error("other error")
            );

            const message: EncapsulatedIMProtoMessage = {
                data: { text: "Hello, world!" },
                type: IM_PROFILE,
                after: "0",
                sha256: "sha256" as sha256,
                timestamp: new Date().toISOString() as ISO8601,
            };

            await listener(peerDid.id, message);

            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe("profileMessagesListener", () => {
        let listener: (
            senderDid: DIDString,
            message: IMProfileMessage
        ) => Promise<void>;
        beforeEach(() => {
            jest.clearAllMocks();
            listener = profileMessagesListener(logger);
        });
        it("saves profile messages to the database", async () => {
            const message: IMProfileMessage = {
                data: {
                    did: peerDid.id,
                    title: "title",
                    description: "description",
                    avatar: "avatar",
                },
                type: IM_PROFILE,
                after: "0",
                sha256: "sha256" as sha256,
                timestamp: new Date().toISOString() as ISO8601,
            };

            await listener(peerDid.id, message);

            expect(updateContact).toHaveBeenCalledWith(message.data);
        });
    });
});
