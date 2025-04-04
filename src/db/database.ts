import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "@/src/db/schema.js";

export const DATABASE_NAME = __DEV__
    ? "dev-smashchats-2025-04-04-10h-40"
    : "prod-smashchats-alpha-2025-01-07";

export const expo_db = openDatabaseSync(DATABASE_NAME, {
    enableChangeListener: true,
    useNewConnection: true,
});
export const drizzle_db = drizzle(expo_db, { schema });
