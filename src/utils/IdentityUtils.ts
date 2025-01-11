import {
    DIDString,
    IM_CHAT_TEXT,
    Logger,
    SmashMessaging,
    SmashUser,
    IM_PROFILE,
    IM_SESSION_RESET,
    DIDDocManager,
    IMPeerIdentity,
    LogLevel,
    SMASH_PROFILE_LIST,
    SmashChatProfileListMessage,
    IMProfile,
    EncapsulatedIMProtoMessage,
    IMProtoMessage,
    IMProfileMessage,
    DIDDocument,
    MessagingEventMap,
    IIMPeerIdentity,
} from "@smashchats/library";

import { IDENTITY_KEY, PROFILE_KEY, getData, saveObject } from "@/src/utils/StorageUtils.js";
import { saveMessageToDb } from "@/src/db/models/Messages";
import {
    getContactsFromDb,
    saveContactToDb,
    updateContact,
} from "@/src/db/models/Contacts";
import { mapReceivedMessageToEnrichedMessage } from "@/src/utils/mappers/messages";
import { MapContactToDid, SmashProfileToContactMapper } from "@/src/utils/mappers/contacts";

const getOrCreateIdentity = async (didDocumentManager: DIDDocManager, logger: Logger): Promise<IMPeerIdentity> => {
    let newIdentity: IMPeerIdentity;
    let savedIdentity = await getData<IIMPeerIdentity>(IDENTITY_KEY);

    if (!savedIdentity) {
        logger.info("creating new identity");
        try {
            newIdentity = await didDocumentManager.generate();
        } catch (error) {
            logger.error("getOrCreateIdentity error", error);
            throw error;
        }
        const newExportedIdentity = await newIdentity.serialize();
        saveObject(IDENTITY_KEY, newExportedIdentity);
    } else {
        logger.info("loading existing identity");
        newIdentity = await SmashMessaging.importIdentity(savedIdentity);
    }

    return newIdentity;
};

export const loadIdentity = async (
    logger: Logger,
    logLevel: LogLevel = "DEBUG"
): Promise<SmashUser> => {
    const didDocumentManager = new DIDDocManager();
    SmashMessaging.use(didDocumentManager);
    // TODO load contact dids from db
    try {
        const savedIdentity = await getOrCreateIdentity(didDocumentManager, logger);
        const meta = await getData<Partial<IMProfile>>(PROFILE_KEY);
        const user = new SmashUser(
            savedIdentity,
            meta?.title ?? "device",
            logLevel,
        );
        if (meta) {
            user.updateMeta(meta);
        }

        const contacts = await getContactsFromDb();
        user.initChats(
            contacts.map((c) => {
                return {
                    with: MapContactToDid(c),
                    lastMessageTimestamp: new Date().toISOString(),
                };
            })
        );
        return user;
    } catch (error) {
        logger.error("loadIdentity error", error);
        throw error;
    }
};

//#region message listeners
const IGNORED_MESSAGE_TYPES = [IM_SESSION_RESET];

export const firehoseListener = (logger: Logger) => async (
    _senderDid: DIDString,
    message: IMProtoMessage
) => {
    if (![IM_CHAT_TEXT, IM_PROFILE, ...IGNORED_MESSAGE_TYPES].includes(message.type)) {
        logger.debug("message received", message);
        logger.warn("unhandled message type", message.type);
    }
};

export const profileMessagesListener = (logger: Logger) => async (_sender: DIDString, message: IMProfileMessage) => {
    logger.debug("parsing profile message", JSON.stringify(message.data));
    await updateContact(message.data)
}

export const textMessagesListener = (logger: Logger) => async (senderDid: DIDString, originalMessage: IMProtoMessage
) => {
    const message = originalMessage as EncapsulatedIMProtoMessage; // TODO remove "as" when lib exports proper types
    try {
        const m = mapReceivedMessageToEnrichedMessage(message, senderDid);
        await saveMessageToDb(m);
    } catch (e) {
        if (e instanceof Error) {
            if (
                e.message.includes(
                    "UNIQUE constraint failed: messages.sha256"
                )
            ) {
                logger.debug("message already saved, skipping");
            } else {
                logger.error(
                    "error saving message, error_message:",
                    e.message,
                    message
                );
            }
        } else {
            logger.error("error saving message, error_object:", e);
        }
    }
}

export const newProfilesMessagesListener = (selfDid: DIDDocument) => async (_sender: DIDString, { data: profiles }: SmashChatProfileListMessage) => {
    for await (const profile of profiles.filter((p) => {
        if (typeof p.did === "string") {
            return p.did !== selfDid.id
        }
        return p.did.id !== selfDid.id
    })) {
        const contact = SmashProfileToContactMapper(profile);
        await saveContactToDb(contact);
    }
}

type EventType = (`${string}.${string}.${string}` | keyof MessagingEventMap)

export const handleUserMessages = async (
    user: SmashUser,
    logger: Logger
) => {
    const selfDid = await user.getDIDDocument();

    const listeners: Partial<Record<EventType, (...args: any[]) => Promise<void>>> = {
        [SMASH_PROFILE_LIST]: newProfilesMessagesListener(selfDid),
        [IM_CHAT_TEXT]: textMessagesListener(logger),
        [IM_PROFILE]: profileMessagesListener(logger),
        "data": firehoseListener(logger)
    }
    const unsubscribes: (() => void)[] = []

    Object.entries(listeners).forEach(([key, value]) => {
        const type = key as EventType
        if (value) {
            user.on(type, value);
            unsubscribes.push(() => user.removeListener(type, value));
        }
    })

    return () => {
        unsubscribes.forEach(unsubscribe => unsubscribe());
    };
};

//#endregion
