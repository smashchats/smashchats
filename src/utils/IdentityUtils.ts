import {
    Logger,
    SmashMessaging,
    SmashUser,
    DIDDocManager,
    IMPeerIdentity,
    LogLevel,
    IMProfile,
    IIMPeerIdentity,
    SmashEndpoint,
    SMEConfigJSONWithoutDefaults,
} from "@smashchats/library";

import {
    IDENTITY_KEY,
    PROFILE_KEY,
    getData,
    saveObject,
} from "@/src/utils/StorageUtils.js";
import { getContactsFromDb } from "@/src/db/models/Contacts";
import { MapContactToDidDocument } from "@/src/utils/mappers/contacts";
import { sme } from "@/data/dev";
import { getDIDManager } from "./DIDManagerSingleton";

export const generateNewIdentity = async (
    didDocumentManager: DIDDocManager
): Promise<IMPeerIdentity> => {
    const newIdentity = await didDocumentManager.generate();
    const preKeyPair = await didDocumentManager.generateNewPreKeyPair(
        newIdentity
    );
    newIdentity.addPreKeyPair(preKeyPair);
    return newIdentity;
};

export const getOrCreateIdentity = async (
    didDocumentManager: DIDDocManager,
    logger: Logger
): Promise<IMPeerIdentity> => {
    let newIdentity: IMPeerIdentity;
    let savedIdentity = await getData<IIMPeerIdentity>(IDENTITY_KEY);

    if (!savedIdentity) {
        logger.info("creating new identity");
        try {
            newIdentity = await generateNewIdentity(didDocumentManager);
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

const joinSme = async (
    user: SmashUser,
    identity: IMPeerIdentity,
    smeConfig: SmashEndpoint,
    didManager: DIDDocManager
) => {
    if (smeConfig) {
        const preKeyPair = identity.signedPreKeys[0];
        if (!preKeyPair) {
            throw new Error("No PreKeyPair found in identity");
        }
        await user.endpoints.reset([
            smeConfig as SmashEndpoint & SMEConfigJSONWithoutDefaults,
        ]);
        didManager.set(await user.getDIDDocument());
    }
};

export const loadIdentity = async (
    logger: Logger,
    logLevel: LogLevel = "DEBUG"
): Promise<SmashUser> => {
    const didDocumentManager = getDIDManager();
    SmashMessaging.use(didDocumentManager);
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

        joinSme(
            user,
            savedIdentity,
            sme as unknown as SmashEndpoint,
            didDocumentManager
        );
        if (meta) {
            user.updateMeta(meta);
        }

        const contacts = await getContactsFromDb();
        user.initChats(
            contacts.map((c) => {
                return {
                    with: MapContactToDidDocument(c),
                    lastMessageTimestamp: new Date(0).toISOString(),
                };
            })
        );
        return user;
    } catch (error) {
        logger.error("loadIdentity error", error);
        throw error;
    }
};
