import {
    EncapsulatedSmashMessage,
    Identity,
    Logger,
    SmashDID,
    SmashMessaging,
    SmashProfileMeta,
    SmashUser,
} from "@smashchats/library";
import { IJsonIdentity } from "2key-ratchet";

import { getData, saveData } from "@/src/StorageUtils.js";
import {
    EnrichedSmashMessage,
    parseDataInMessage,
    saveMessageToDb,
} from "@/src/models/Messages";
import {
    MapContactToDid,
    getContactsFromDb,
    saveContactToDb,
} from "@/src/models/Contacts";

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
        const meta = await getData<SmashProfileMeta>("settings.user_meta");
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
    user.on(
        "nbh_profiles",
        async (
            _sender: SmashDID,
            profiles: {
                meta: SmashProfileMeta;
                did: SmashDID;
                scores: { score: number };
            }[]
        ) => {
            for (const profile of profiles.filter((p) => p.did.id !== selfDid.id)) {
                const contact = {
                    did_id: profile.did.id,
                    did_ik: profile.did.ik,
                    did_ek: profile.did.ek,
                    did_signature: profile.did.signature,
                    did_endpoints: profile.did.endpoints ?? [],
                    meta_title: profile.meta.title,
                    meta_description: profile.meta.description,
                    meta_picture: profile.meta.picture,
                };
                await saveContactToDb(contact);
            }
        }
    );
    const messageListener = async (
        message: EncapsulatedSmashMessage,
        senderDid: SmashDID
    ) => {
        const m = getEnrichedMessage(message, senderDid);
        try {
            await saveMessageToDb(m);
            await parseDataInMessage(m);
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

export const getEnrichedMessage = (
    message: EncapsulatedSmashMessage,
    senderDid: SmashDID
) => {
    let data;
    if (typeof message.data === "string") {
        data = message.data;
    } else {
        data = JSON.stringify(message.data);
    }
    const m: EnrichedSmashMessage = {
        ...message,
        fromDid: senderDid,
        toDiscussionId: senderDid.id,
        data,
    };
    return m;
};
