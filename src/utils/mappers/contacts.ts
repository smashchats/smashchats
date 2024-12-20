import { DIDDocument, DIDString, SmashEndpoint, SmashProfileList } from "@smashchats/library";

import { Contact, ContactInsert } from "@/src/db/models/Contacts";

export const SmashProfileToContactMapper = (profile: SmashProfileList[0]) => {
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

export const MapContactToDid = (c: Contact): DIDDocument => {
    return {
        id: c.did_id as DIDString,
        ik: c.did_ik as string,
        ek: c.did_ek as string,
        signature: c.did_signature as string,
        endpoints: c.did_endpoints as SmashEndpoint[] ?? [],
    };
};

export const MapDidToContact = (did: DIDDocument): ContactInsert => {
    return {
        did_id: did.id,
        did_ik: did.ik,
        did_ek: did.ek,
        did_signature: did.signature,
        did_endpoints: did.endpoints,
    };
};
