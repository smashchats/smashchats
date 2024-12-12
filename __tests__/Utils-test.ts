import { DAY, daysBetweenTwoDates, HOUR, MINUTE, SECOND } from "@/src/Utils";

fdescribe("Utils", () => {
    describe("time", () => {
        test("units are correct", () => {
            expect(DAY).toBe(24 * HOUR);
            expect(HOUR).toBe(60 * MINUTE);
            expect(MINUTE).toBe(60 * SECOND);
            expect(SECOND).toBe(1000);
        });

        describe("diffInDays", () => {
            it("returns 1 for 1 day difference", () => {
                const dateStart = new Date("2024-02-29");
                const dateEnd = new Date("2024-03-01");
                expect(daysBetweenTwoDates(dateStart, dateEnd)).toBe(1);
            });

            it("returns 0 for same day", () => {
                const dateStart = new Date("2024-02-29");
                const dateEnd = new Date("2024-02-29");
                expect(daysBetweenTwoDates(dateStart, dateEnd)).toBe(0);
            });

            it("returns 1 for 1 day difference in reverse", () => {
                const dateStart = new Date("2024-03-01");
                const dateEnd = new Date("2024-02-29");
                expect(daysBetweenTwoDates(dateStart, dateEnd)).toBe(1);
            });

            it("returns 1 for yesterday midnight", () => {
                const dateEnd = new Date("2024-02-29");
                const dateStart = new Date(
                    `${new Date(dateEnd.getTime() - 1 * DAY).toDateString()} 23:59:00Z`
                );
                expect(daysBetweenTwoDates(dateStart, dateEnd)).toBe(1);
            });
        });
    });
});
