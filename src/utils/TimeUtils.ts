/**
 * Formats a duration in seconds into a MM:SS string format
 * @param seconds - The number of seconds to format
 * @returns A string in the format "M:SS" where M is minutes and SS is seconds with leading zero
 */
export const formatDuration = (seconds: number): string => {
    const safeSeconds = Math.abs(seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const daysBetweenTwoDates = (dateStart: Date, dateEnd: Date): number => {
    const diff =
        new Date(dateEnd.toISOString().substring(0, 10)).getTime() -
        new Date(dateStart.toISOString().substring(0, 10)).getTime();
    return Math.abs(Math.floor(diff / DAY));
};

export function dateToShowableString(date: Date): string {
    const now = new Date();
    const diffInDays = daysBetweenTwoDates(date, now);

    if (diffInDays === 0) {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }
    if (diffInDays === 1) {
        return "Yesterday";
    }
    if (diffInDays < 7) {
        const weekdays = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        return weekdays[date.getDay()];
    }
    return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}
