import { sql } from "drizzle-orm";
import { SQLiteDatabase } from "expo-sqlite";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

import * as schema from "@/src/db/schema.js";

export async function resetIdentity(
    db: ExpoSQLiteDatabase<typeof schema> & {
        $client: SQLiteDatabase;
    }
) {
    console.log("⏳ Resetting database...");
    const start = Date.now();

    const tables = Object.keys(schema);

    for (const table of tables) {
        try {
            console.debug("Dropping table", table);

            await db.run(sql`DROP TABLE IF EXISTS ${sql.identifier(table)}`);
        } catch (error) {
            console.error("Error resetting database", error);
        }
    }

    const end = Date.now();
    console.log(`✅ Reset complete & took ${end - start}ms`);
    console.log("");
}
