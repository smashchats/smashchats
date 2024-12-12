import { Platform } from "react-native";
import {
    EncapsulatedSmashMessage,
    Identity,
    SmashDID,
    SmashMessaging,
    SmashProfileMeta,
    SmashUser,
} from "smash-node-lib";
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

const getOrCreateIdentity = async (): Promise<Identity> => {
    // TODO: replace with hardware-backed crypto storage
    let savedIdentity: IJsonIdentity | null = await getData<IJsonIdentity>(
        "identity"
    );

    let newIdentity: Identity;
    if (!savedIdentity) {
        console.log("creating new identity");
        try {
            newIdentity = await SmashMessaging.generateIdentity(1, 0, true);
        } catch (error) {
            console.error("getOrCreateIdentity error", error);
            throw error;
        }
        saveData<IJsonIdentity>(
            "identity",
            await SmashMessaging.serializeIdentity(newIdentity)
        );
    } else {
        console.log("loading existing identity");
        newIdentity = await SmashMessaging.deserializeIdentity(savedIdentity);
    }

    return newIdentity;
};

export const loadIdentity = async (
    LOG_LEVEL: "DEBUG" | "INFO" | "WARN" | "ERROR" = "DEBUG"
): Promise<SmashUser> => {
    try {
        const savedIdentity = await getOrCreateIdentity();
        const meta = await getData<SmashProfileMeta>("settings.user_meta");
        const user = new SmashUser(
            savedIdentity,
            meta ?? undefined,
            LOG_LEVEL,
            Platform.Version === "17.5" ? "simulator" : "device"
        );

        const contacts = await getContactsFromDb();
        user.initChats(
            contacts.map((c) => {
                return {
                    with: MapContactToDid(c),
                    // TODO: get last message timestamp from db
                    lastMessageTimestamp: new Date().toISOString(),
                };
            })
        );
        return user;
    } catch (error) {
        console.error("loadIdentity error", error);
        throw error;
    }
};

export const handleUserMessages = async (user: SmashUser) => {
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
            for (const profile of profiles) {
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
                    console.debug("message already saved, skipping");
                } else {
                    console.error(
                        "error saving message, error_message:",
                        e.message,
                        message
                    );
                }
            } else {
                console.error("error saving message, error_object:", e);
            }
        }
    };
    user.on("message", messageListener);
    return () => {
        user.removeListener("message", messageListener);
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
