import { InferSelectModel, eq } from "drizzle-orm";
import { trustRelations } from "@/src/db/schema";
import { drizzle_db } from "@/src/db/database";

export type TrustRelation = InferSelectModel<typeof trustRelations>;

export const createTrustRelation = async (did_id: string, name: string) => {
    console.debug("Creating TrustRelation for", did_id);
    await drizzle_db
        .insert(trustRelations)
        .values({
            did_id,
            name,
            created_at: new Date(),
        })
        .onConflictDoNothing();
};

export const deleteTrustRelation = async (did_id: string) => {
    console.debug("Deleting TrustRelation for", did_id);
    await drizzle_db
        .delete(trustRelations)
        .where(eq(trustRelations.did_id, did_id));
};
