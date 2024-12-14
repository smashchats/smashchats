import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";
import * as schema from "@/src/db/schema.js";

export const DATABASE_NAME = __DEV__
    ? "dev-smashchats-2024-12-12-13h-32"
    : "prod-smashchats-alpha";

export const expo_db = openDatabaseSync(DATABASE_NAME, {
    enableChangeListener: true,
    useNewConnection: true,
});
export const drizzle_db = drizzle(expo_db, { schema });