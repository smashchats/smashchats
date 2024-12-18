import { Platform } from "react-native";
import {
    DIDString,
    EncapsulatedIMProtoMessage,
    IMProfile,
    IM_CHAT_TEXT,
    Identity,
    SMASH_NBH_PROFILE_LIST,
    SmashMessaging,
    SmashProfileList,
    SmashUser,
} from "@smashchats/library";
import { IJsonIdentity } from "2key-ratchet";

import { getData, saveData } from "@/src/StorageUtils.js";
import {
    EnrichedSmashMessage,
    saveMessageToDb,
} from "@/src/models/Messages";
import {
    MapContactToDid,
    getContactsFromDb,
    saveContactToDb,
} from "@/src/models/Contacts";

const getOrCreateIdentity = async (): Promise<Identity> => {
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
        const meta = await getData<IMProfile>("settings.user_meta");
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

const SmashProfileToContactMapper = (profile: SmashProfileList[0]) => {
    return {
        did_id: profile.did.id,
        did_ik: profile.did.ik,
        did_ek: profile.did.ek,
        did_signature: profile.did.signature,
        did_endpoints: profile.did.endpoints ?? [],
        meta_title: profile.meta?.title,
        meta_description: profile.meta?.description,
        meta_avatar: profile.meta?.avatar,
    };
};

export const handleUserMessages = async (user: SmashUser) => {
    // Handle profile list updates
    user.on(
        SMASH_NBH_PROFILE_LIST,
        async (_, profiles: SmashProfileList) => {
            for (const profile of profiles) {
                const contact = SmashProfileToContactMapper(profile);
                await saveContactToDb(contact);
            }
        }
    );

    // Handle text messages
    const textMessageListener = async (
        senderDid: DIDString,
        message: EncapsulatedIMProtoMessage,
    ) => {
        const m = mapReceivedMessageToEnrichedMessage(message, senderDid);
        await saveMessageToDb(m);
    };
    user.on(IM_CHAT_TEXT, textMessageListener);

    return () => {
        user.removeListener(IM_CHAT_TEXT, textMessageListener);
    };
};

export const mapReceivedMessageToEnrichedMessage = (
    message: EncapsulatedIMProtoMessage,
    senderDid: DIDString,
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
        toDiscussionId: senderDid,
        data,
    };
    return m;
};
