import { InferInsertModel, InferSelectModel, eq, isNotNull } from "drizzle-orm";
import { SQLiteInsertOnConflictDoUpdateConfig } from "drizzle-orm/sqlite-core";

import { IMProfile } from "@smashchats/library";

import { contacts, trustRelations } from "@/src/db/schema.js";
import { drizzle_db } from "@/src/db/database";
import { ResolveDidAndMapToContactInsert } from "@/src/utils/mappers/contacts";

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

interface UpdateOptions {
    onConflictDoNothing?: boolean;
    onConflictDoUpdate?: Omit<
        SQLiteInsertOnConflictDoUpdateConfig<any>,
        "target"
    >;
}

const genericUpdateContact = async (
    did_id: string,
    updates: Partial<ContactInsert>,
    options: UpdateOptions = {}
) => {
    let query = drizzle_db.insert(contacts).values({
        ...updates,
        did_id,
    });

    if (options.onConflictDoNothing) {
        query = query.onConflictDoNothing();
    } else if (options.onConflictDoUpdate) {
        query = query.onConflictDoUpdate({
            ...options.onConflictDoUpdate,
            target: [contacts.did_id],
        });
    }

    const [updatedContact] = await query.returning();
    return updatedContact;
};

export const patchContact = async (
    did_id: string,
    updates: Partial<ContactInsert>
) => {
    return genericUpdateContact(did_id, updates, {
        onConflictDoUpdate: { set: updates },
    });
};

export const updateContact = async (profile: IMProfile) => {
    const { title, description, avatar } = profile;

    const did: ContactInsert = await ResolveDidAndMapToContactInsert(profile);

    const data = {
        ...did,
        meta_title: title,
        meta_description: description,
        meta_avatar: avatar,
        updated_at: new Date(),
    };

    return genericUpdateContact(did.did_id, data, {
        onConflictDoUpdate: { set: data },
    });
};

export const getAllContactNotesQuery = drizzle_db
    .select({
        notes: contacts.notes,
    })
    .from(contacts)
    .where(isNotNull(contacts.notes));

export const getAllContactNotes = async (): Promise<string[]> => {
    const notes = await getAllContactNotesQuery;
    return notes.map((note) => note.notes) as string[];
};
