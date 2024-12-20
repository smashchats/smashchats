import { InferSelectModel } from "drizzle-orm";
import { trustRelations } from "@/src/db/schema";
import { drizzle_db } from "@/src/db/database";

export type TrustRelation = InferSelectModel<typeof trustRelations>;

export const createTrustRelation = async (senderDidId: string) => {
    console.debug("Creating TrustRelation for", senderDidId);
    await drizzle_db
        .insert(trustRelations)
        .values({
            did_id: senderDidId,
            name: "Neighborhood Admin",
            created_at: new Date(),
        })
        .onConflictDoNothing();
};
