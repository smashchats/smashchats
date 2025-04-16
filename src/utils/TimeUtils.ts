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
