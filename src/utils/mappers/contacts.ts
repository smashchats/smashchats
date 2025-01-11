import { DIDDocument, DIDString, IMProfile, SmashEndpoint, SmashProfileList } from "@smashchats/library";

import { Contact, ContactInsert } from "@/src/db/models/Contacts";
import { addPrefixToObjectKeys } from "@/src/utils/Utils";
import { PartialWithId } from "@/src/types/";

export const SmashProfileToContactMapper = (profile: SmashProfileList[0]) => {
    const did: Partial<DIDDocument> = {};
    if (typeof profile.did === "string") {
        did.id = profile.did;
    } else {
        did.id = profile.did.id;
        did.ik = profile.did.ik;
        did.ek = profile.did.ek;
        did.signature = profile.did.signature;
        did.endpoints = profile.did.endpoints ?? [];
    }
    return {
        did_id: did.id,
        did_ik: did.ik,
        did_ek: did.ek,
        did_signature: did.signature,
        did_endpoints: did.endpoints ?? [],
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

export const MapImProfileToPartialDidDocument = (profile: IMProfile): PartialWithId<DIDDocument> => {
    const { did } = profile;

    let didObject: { id: DIDString, ik?: string, ek?: string, signature?: string, endpoints?: SmashEndpoint[] };

    if (typeof did === "string") {
        didObject = {
            id: did,
        };
    } else {
        didObject = {
            id: did.id,
            ik: did.ik,
            ek: did.ek,
            signature: did.signature,
            endpoints: did.endpoints,
        };
    }
    return didObject
};

export const MapDidDocumentToContactInsert = (did: Partial<DIDDocument>): Partial<ContactInsert> => {
    return {
        ...addPrefixToObjectKeys(did, "did_"),
    };
};
