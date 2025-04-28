import {
    dateToShowableString,
    DAY,
    daysBetweenTwoDates,
    formatDuration,
    HOUR,
    MINUTE,
    SECOND,
} from "@/src/utils/TimeUtils";

describe("TimeUtils", () => {
    describe("formatDuration", () => {
        it("should format seconds less than a minute correctly", () => {
            expect(formatDuration(0)).toBe("0:00");
            expect(formatDuration(30)).toBe("0:30");
            expect(formatDuration(59)).toBe("0:59");
        });

        it("should format minutes and seconds correctly", () => {
            expect(formatDuration(60)).toBe("1:00");
            expect(formatDuration(61)).toBe("1:01");
            expect(formatDuration(3599)).toBe("59:59");
        });

        it("should handle large numbers of minutes", () => {
            expect(formatDuration(3600)).toBe("60:00");
            expect(formatDuration(7200)).toBe("120:00");
        });

        it("should handle negative numbers by treating them as positive", () => {
            expect(formatDuration(-30)).toBe("0:30");
            expect(formatDuration(-60)).toBe("1:00");
        });
    });

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
                `${new Date(
                    dateEnd.getTime() - 1 * DAY
                ).toDateString()} 23:59:00Z`
            );
            expect(daysBetweenTwoDates(dateStart, dateEnd)).toBe(1);
        });
    });

    describe("date display", () => {
        it("shows the time if the message was sent in the same day", () => {
            const date = new Date(new Date().getTime() - 1 * HOUR);
            const result = dateToShowableString(date);

            // expect to match regex for time
            expect(result).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
        });

        it('shows "Yesterday" if the message was sent more than one day ago', () => {
            const date = new Date(new Date().getTime() - 1 * DAY);
            const result = dateToShowableString(date);

            expect(result).toBe("Yesterday");
        });

        it("shows the weekday if the message was sent less than one week ago", () => {
            const date = new Date(new Date().getTime() - 3 * DAY);
            const result = dateToShowableString(date);

            expect(result).toMatch(
                /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/
            );
        });

        it("shows the date if the message was sent more than one week ago", () => {
            const date = new Date("2024-05-01");
            const result = dateToShowableString(date);

            expect(result).toBe("05/01/2024");
        });
    });
});
