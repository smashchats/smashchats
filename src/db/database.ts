import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";
import * as schema from "@/src/db/schema.js";

export const DATABASE_NAME = __DEV__
    ? "dev-smashchats-2025-01-15-21h-37"
    : "prod-smashchats-alpha-2025-01-07";

export const expo_db = openDatabaseSync(DATABASE_NAME, {
    enableChangeListener: true,
    useNewConnection: true,
});
export const drizzle_db = drizzle(expo_db, { schema });
