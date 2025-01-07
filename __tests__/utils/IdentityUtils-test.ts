import { handleUserMessages } from "@/src/utils/IdentityUtils"
import { IM_CHAT_TEXT, IM_PROFILE, Logger, SMASH_PROFILE_LIST, SmashUser } from "@smashchats/library"

describe("listeners", () => {
    const EVENT_TYPES = [IM_CHAT_TEXT, IM_PROFILE, SMASH_PROFILE_LIST]

    EVENT_TYPES.forEach(t => {
        it(`sets a listener for ${t}`, async () => {
            const user: SmashUser = {
                on: jest.fn(),
                getDIDDocument: jest.fn(),
                removeListener: jest.fn()
            } as unknown as SmashUser

            const logger: Logger = {
                debug: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            } as unknown as Logger

            const unsubscribe = await handleUserMessages(user, logger)

            expect(user.on).toHaveBeenCalledWith(t, expect.anything())

            unsubscribe();

            expect(user.removeListener).toHaveBeenCalled()
        })
    })
})
