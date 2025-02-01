// source: https://stackoverflow.com/a/76996401
const EMOJI_REGEX =
    /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\uFE0F\u20E3?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u200D(\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\uFE0F\u20E3?|[\u{E0020}-\u{E007E}]+\u{E007F})?))*/gu;

export const extractEmojisFromText = (text: string) => {
    return text.match(EMOJI_REGEX) || [];
};

export const extractEmojisFromNotes = (notes: string[]) => {
    return notes.map((note) => extractEmojisFromText(note)).flat();
};

export const countUniqueEmojisInNotes = (notes: string[]) => {
    const emojiCount: { [key: string]: number } = {};
    extractEmojisFromNotes(notes).forEach((emoji) => {
        emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
    });
    return Object.entries(emojiCount)
        .map(([emoji, count]) => ({ emoji, count }))
        .sort((a, b) => b.count - a.count);
};
