import { DATABASE_NAME } from "@/src/db/database";

import { openDatabaseSync } from "expo-sqlite/next";

jest.mock("expo-sqlite/next", () => ({
    openDatabaseSync: jest.fn().mockReturnValue({
        // Mock minimum required database interface
        transaction: jest.fn(),
        exec: jest.fn(),
        close: jest.fn(),
    }),
}));

describe("database file name", () => {
    it("uses dev- prefix in dev", () => {
        expect(DATABASE_NAME).toMatch(/^dev-/);
    });

    it("opens the database", () => {
        expect(openDatabaseSync).toHaveBeenCalledWith(DATABASE_NAME, {
            enableChangeListener: true,
            useNewConnection: true,
        });
    });
});
