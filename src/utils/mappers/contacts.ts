import { DIDDocument, DIDString, IMProfile, SmashEndpoint, SmashMessaging, SmashProfileList } from "@smashchats/library";

import { Contact, ContactInsert } from "@/src/db/models/Contacts";

export const SmashProfileToContactMapper = async (profile: SmashProfileList[0]) => {
    const did = MapDidToContactInsert(await SmashMessaging.resolve(profile.did));

    return {
        ...did,
        meta_title: profile.meta?.title,
        meta_description: profile.meta?.description,
        meta_avatar: profile.meta?.avatar,
    };
};

export const MapContactToDidDocument = (c: Contact): DIDDocument => {
    return {
        id: c.did_id as DIDString,
        ik: c.did_ik as string,
        ek: c.did_ek as string,
        signature: c.did_signature as string,
        endpoints: c.did_endpoints as SmashEndpoint[] ?? [],
    };
};

export const MapDidToContactInsert = (did: DIDDocument): ContactInsert => {
    return {
        did_id: did.id,
        did_ik: did.ik,
        did_ek: did.ek,
        did_signature: did.signature,
        did_endpoints: did.endpoints ?? [],
    };
};

export const ResolveDidAndMapToContactInsert = async (profile: IMProfile): Promise<ContactInsert> => {
    const did = await SmashMessaging.resolve(profile.did);
    return MapDidToContactInsert(did);
};
