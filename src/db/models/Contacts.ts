import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";

import { IMProfile, SmashEndpoint } from "@smashchats/library";

import { contacts, trustRelations } from "@/src/db/schema.js";
import { drizzle_db } from "@/src/db/database";

export type Contact = InferSelectModel<typeof contacts>;
export type TrustedContact = Contact & { trusted_name: string | undefined };
export type ContactInsert = InferInsertModel<typeof contacts>;

export const saveContactToDb = async (contact: ContactInsert) => {
    const [contactId] = await drizzle_db
        .insert(contacts)
        .values(contact)
        .onConflictDoUpdate({
            target: [contacts.did_id],
            set: {
                did_ik: contact.did_ik,
                did_ek: contact.did_ek,
                did_signature: contact.did_signature,
                did_endpoints: contact.did_endpoints,
                updated_at: new Date(),
                scores: contact.scores,
                meta_title: contact.meta_title,
                meta_description: contact.meta_description,
                meta_avatar: contact.meta_avatar,
            },
        })
        .returning({ id: contacts.did_id });
    return contactId;
};

export const getContactWithTrustRelation = async (
    did_id: string
): Promise<TrustedContact> => {
    const result = await drizzle_db
        .select()
        .from(contacts)
        .leftJoin(trustRelations, eq(contacts.did_id, trustRelations.did_id))
        .where(eq(contacts.did_id, did_id))
        .limit(1);

    return {
        ...result[0].contacts,
        trusted_name: result[0].trust_relations?.name,
    };
};

export const getContactsFromDb = async (): Promise<Contact[]> => {
    const contacts = await drizzle_db.query.contacts.findMany();
    return contacts;
};

export const updateContact = async (profile: IMProfile) => {
    const { did, title, description, avatar } = profile;

    let didObject: { did_id: string, did_ik?: string, did_ek?: string, did_signature?: string, did_endpoints?: SmashEndpoint[] };

    if (typeof did === "string") {
        didObject = {
            did_id: did,
        };
    } else {
        didObject = {
            did_id: did.id,
            did_ik: did.ik,
            did_ek: did.ek,
            did_signature: did.signature,
            did_endpoints: did.endpoints,
        };
    }

    const [updatedContact] = await drizzle_db
        .insert(contacts)
        .values({
            ...didObject,
            meta_title: title,
            meta_description: description,
            meta_avatar: avatar,
            updated_at: new Date(),
        })
        .onConflictDoUpdate({
            target: [contacts.did_id],
            set: {
                ...didObject,
                meta_title: title,
                meta_description: description,
                meta_avatar: avatar,
                updated_at: new Date(),
            },
        })
        .returning();
    return updatedContact;
};
