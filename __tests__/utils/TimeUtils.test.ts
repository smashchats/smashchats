import { formatDuration } from "@/src/utils/TimeUtils";

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
});
