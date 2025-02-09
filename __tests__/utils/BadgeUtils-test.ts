import {
    badgeToString,
    convertBadgeValueToUnit,
    getCategories,
} from "@/src/utils/BadgeUtils";

describe("BadgeUtils", () => {
    describe("badgeToString", () => {
        it("should return the badge string", () => {
            const result = badgeToString("hey", {});
            expect(result).toBe("hey");
        });

        it("should return the badge string with a value of an object", () => {
            const badge = {
                label: "test",
                unit: "com.smashchats.units.ft",
                value: 6,
            };
            const result = badgeToString(badge, {});
            expect(result).toBe("test: 6 ft");
        });

        it("should return the badge string with a value of an object and a unit preference", () => {
            const badge = {
                label: "size",
                unit: "com.smashchats.units.ft",
                value: 6,
            };
            const result = badgeToString(badge, {
                length: "com.smashchats.units.cm",
            });
            expect(result).toBe("size: 182.88 cm");
        });
    });

    describe("convertBadgeValueToUnit", () => {
        it("should convert one unit to another", () => {
            const result = convertBadgeValueToUnit(
                {
                    label: "size",
                    unit: "com.smashchats.units.ft",
                    value: 6,
                },
                "com.smashchats.units.cm"
            );
            expect(Math.abs(result - 183)).toBeLessThan(1);
        });

        it("should not fail if the converter doesn't exist", () => {
            const result = convertBadgeValueToUnit(
                {
                    label: "size",
                    unit: "com.smashchats.units.ft",
                    value: 6,
                },
                "com.smashchats.units.m"
            );
            expect(result).toBe(6);
        });

        it("should not fail if the unit is the same", () => {
            const result = convertBadgeValueToUnit(
                {
                    label: "size",
                    unit: "com.smashchats.units.cm",
                    value: 183,
                },
                "com.smashchats.units.cm"
            );
            expect(result).toBe(183);
        });
    });
});

describe("getCategories", () => {
    it("should return the categories", () => {
        const result = getCategories([
            {
                category: "com.smashchats.badges.socials",
                value: "test",
                id: 1,
            },
            {
                category: "com.smashchats.badges.interests",
                value: "test",
                id: 2,
            },
            {
                category: "com.smashchats.badges.interests",
                value: "duplicate",
                id: 3,
            },
        ]);
        expect(result).toEqual([
            "com.smashchats.badges.socials",
            "com.smashchats.badges.interests",
        ]);
    });
});
