import {
    DIDString,
    EncapsulatedIMProtoMessage,
    IMProfile,
    IM_CHAT_TEXT,
    Identity,
    ISO8601,
    Logger,
    SMASH_NBH_PROFILE_LIST,
    SmashMessaging,
    SmashProfileList,
    SmashUser,
    sha256,
    IM_PROFILE,
    IM_SESSION_RESET,
} from "@smashchats/library";
import { IJsonIdentity } from "2key-ratchet";

import { getData, saveData } from "@/src/utils/StorageUtils.js";
import {
    parseDataInMessage,
    saveMessageToDb,
} from "@/src/db/models/Messages";
import {
    getContactsFromDb,
    saveContactToDb,
} from "@/src/db/models/Contacts";
import { mapReceivedMessageToEnrichedMessage } from "@/src/utils/mappers/messages";
import { MapContactToDid, SmashProfileToContactMapper } from "@/src/utils/mappers/contacts";

const getOrCreateIdentity = async (logger: Logger): Promise<Identity> => {
    let savedIdentity: IJsonIdentity | null = await getData<IJsonIdentity>(
        "identity"
    );

    let newIdentity: Identity;
    if (!savedIdentity) {
        logger.info("creating new identity");
        try {
            newIdentity = await SmashMessaging.generateIdentity(1, 0, true);
        } catch (error) {
            logger.error("getOrCreateIdentity error", error);
            throw error;
        }
        saveData<IJsonIdentity>(
            "identity",
            await SmashMessaging.serializeIdentity(newIdentity)
        );
    } else {
        logger.info("loading existing identity");
        newIdentity = await SmashMessaging.deserializeIdentity(savedIdentity);
    }

    return newIdentity;
};

export const loadIdentity = async (
    logger: Logger,
    LOG_LEVEL: "DEBUG" | "INFO" | "WARN" | "ERROR" = "DEBUG"
): Promise<SmashUser> => {
    try {
        const savedIdentity = await getOrCreateIdentity(logger);
        const meta = await getData<IMProfile>("settings.user_meta");
        const user = new SmashUser(
            savedIdentity,
            meta ?? undefined,
            LOG_LEVEL,
            meta?.title ?? "device"
        );

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



export const handleUserMessages = async (
    user: SmashUser,
    logger: Logger
) => {
    const selfDid = await user.getDID();
    // Handle profile list updates
    user.on(
        SMASH_NBH_PROFILE_LIST,
        async (_, profiles: SmashProfileList) => {
            for (const profile of profiles.filter((p) => p.did.id !== selfDid.id)) {
                const contact = SmashProfileToContactMapper(profile);
                await saveContactToDb(contact);
            }
        }
    );

    const IGNORED_MESSAGE_TYPES = [IM_SESSION_RESET];

    const messageListener = async (
        senderDid: DIDString,
        message: EncapsulatedIMProtoMessage,
        _sha256: sha256,
        _timestamp: ISO8601
    ) => {
        logger.debug("message received", message);
        try {

            if (message.type === IM_CHAT_TEXT) {
                const m = mapReceivedMessageToEnrichedMessage(message, senderDid);
                await saveMessageToDb(m);
            }
            await parseDataInMessage(message, logger);
            if (![IM_CHAT_TEXT, IM_PROFILE, ...IGNORED_MESSAGE_TYPES].includes(message.type)) {
                logger.warn("unhandled message type", message.type);
            }
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
    };
    user.on("data", messageListener);
    return () => {
        user.removeListener("data", messageListener);
    };
};
