import {
    Logger,
    SmashMessaging,
    SmashUser,
    DIDDocManager,
    IMPeerIdentity,
    LogLevel,
    IMProfile,
    IIMPeerIdentity,
} from "@smashchats/library";

import {
    IDENTITY_KEY,
    PROFILE_KEY,
    getData,
    saveObject,
} from "@/src/utils/StorageUtils.js";
import {
    getContactsFromDb,
} from "@/src/db/models/Contacts";
import {
    MapContactToDidDocument,
} from "@/src/utils/mappers/contacts";

export const getOrCreateIdentity = async (
    didDocumentManager: DIDDocManager,
    logger: Logger
): Promise<IMPeerIdentity> => {
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
        const savedIdentity = await getOrCreateIdentity(
            didDocumentManager,
            logger
        );
        const meta = await getData<Partial<IMProfile>>(PROFILE_KEY);
        const user = new SmashUser(
            savedIdentity,
            meta?.title ?? "device",
            logLevel
        );
        if (meta) {
            user.updateMeta(meta);
        }

        const contacts = await getContactsFromDb();
        user.initChats(
            contacts.map((c) => {
                return {
                    with: MapContactToDidDocument(c),
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
