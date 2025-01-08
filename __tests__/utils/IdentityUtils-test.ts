import { ContactInsert, saveContactToDb } from "@/src/db/models/Contacts";
import { handleUserMessages, newProfilesMessagesListener } from "@/src/utils/IdentityUtils"
import { DIDDocument, IM_CHAT_TEXT, IM_PROFILE, Logger, SMASH_PROFILE_LIST, SmashChatProfileListMessage, SmashUser } from "@smashchats/library"

jest.mock("@/src/db/models/Contacts", () => ({
    saveContactToDb: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue([]) }),
}));

describe("listeners", () => {
    const EVENT_TYPES = [IM_CHAT_TEXT, IM_PROFILE, SMASH_PROFILE_LIST]

    let logger: Logger;
    let user: SmashUser;

    beforeEach(() => {
        jest.clearAllMocks();

        logger = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        } as unknown as Logger

        user = {
            on: jest.fn(),
            getDIDDocument: jest.fn(),
            removeListener: jest.fn()
        } as unknown as SmashUser
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    EVENT_TYPES.forEach(t => {
        it(`sets a listener for ${t}`, async () => {
            const unsubscribe = await handleUserMessages(user, logger)

            expect(user.on).toHaveBeenCalledWith(t, expect.anything())

            unsubscribe();

            expect(user.removeListener).toHaveBeenCalled()
        })
    })

    describe("newProfilesMessagesListener", () => {
        it("saves new profiles to the database", async () => {
            const selfDid = { id: "did:smash:self" } as unknown as DIDDocument
            const peerDid = { id: "did:smash:peer" } as unknown as DIDDocument

            const listener = newProfilesMessagesListener(selfDid)

            const message: SmashChatProfileListMessage = {
                data: [{ did: peerDid, }],
                type: SMASH_PROFILE_LIST,
                after: "0"
            }

            await listener(peerDid.id, message)
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

            expect(saveContactToDb).toHaveBeenCalledWith(contact)
        })
    })
})
