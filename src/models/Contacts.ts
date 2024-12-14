import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";

import { contacts, trustRelations } from "@/src/db/schema.js";
import { drizzle_db } from "@/src/db/database";
import { SmashEndpoint, SmashDID, SmashProfile } from "@smashchats/library";

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
                meta_picture: contact.meta_picture,
            },
        })
        .returning({ id: contacts.did_id });
    return contactId;
};

export const getContactFromDb = async (
    did_id: string
): Promise<Contact | undefined> => {
    console.debug("getContactFromDb", did_id);
    const contact = await drizzle_db.query.contacts.findFirst({
        where: eq(contacts.did_id, did_id),
    });
    return contact;
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

export const updateContact = async (profile: SmashProfile) => {
    const { meta, did, scores } = profile;
    const [updatedContact] = await drizzle_db
        .insert(contacts)
        .values({
            did_id: did.id,
            meta_title: meta?.title,
            meta_description: meta?.description,
            meta_picture: meta?.picture,
            scores: scores,
            did_ik: did.ik,
            did_ek: did.ek,
            did_signature: did.signature,
            did_endpoints: did.endpoints,
            updated_at: new Date(),
        })
        .onConflictDoUpdate({
            target: [contacts.did_id],
            set: {
                meta_title: meta?.title,
                meta_description: meta?.description,
                meta_picture: meta?.picture,
                scores: scores,
                updated_at: new Date(),
                did_ik: did.ik,
                did_ek: did.ek,
                did_signature: did.signature,
                did_endpoints: did.endpoints,
            },
        })
        .returning();
    return updatedContact;
};

export const MapContactToDid = (c: Contact): SmashDID => {
    return {
        id: c.did_id,
        ik: c.did_ik,
        ek: c.did_ek,
        signature: c.did_signature,
        endpoints: c.did_endpoints as SmashEndpoint[],
    };
};
