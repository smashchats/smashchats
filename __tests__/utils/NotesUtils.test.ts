import {
    countUniqueEmojisInNotes,
    extractEmojisFromText,
} from "@/src/utils/NotesUtils";

describe("extractEmojisFromText", () => {
    it("returns an array of emojis", () => {
        const result = extractEmojisFromText(
            "This is a test message with an emoji 👋"
        );
        expect(result).toEqual(["👋"]);
    });

    it("returns an empty array if there are no emojis", () => {
        const result = extractEmojisFromText("This is a test message");
        expect(result).toEqual([]);
    });

    it("correctly returns complex emojis", () => {
        const result = extractEmojisFromText("✔✔️3️⃣🇺🇾👩🏿‍❤️‍👨🏿");
        expect(result).toEqual(["✔", "✔️", "3️⃣", "🇺🇾", "👩🏿‍❤️‍👨🏿"]);
    });
});

describe("countUniqueEmojisInNotes", () => {
    it("returns an array of objects with emoji and count", () => {
        const result = countUniqueEmojisInNotes([
            { notes: "This is a test message with an emoji 👋" },
            { notes: "This is a test message with an emoji 👋" },
        ]);
        expect(result).toEqual([{ emoji: "👋", count: 2 }]);
    });

    it("returns an empty array if there are no emojis", () => {
        const result = countUniqueEmojisInNotes([
            { notes: "This is a test message" },
        ]);
        expect(result).toEqual([]);
    });

    it("returns an array of objects sorted by count", () => {
        const result = countUniqueEmojisInNotes([
            { notes: "🎾" },
            { notes: "This is a test message with an emoji 👋" },
            { notes: "This is a test message with an emoji 👋" },
            { notes: "This is a test message with an emoji 👋" },
            { notes: "🎾" },
        ]);
        expect(result).toEqual([
            { emoji: "👋", count: 3 },
            { emoji: "🎾", count: 2 },
        ]);
    });

    describe("edge cases", () => {
        it("returns an empty array if the note content is null", () => {
            const result = countUniqueEmojisInNotes([{ notes: null }]);
            expect(result).toEqual([]);
        });
        it("returns an empty array if the notes are null", () => {
            // @ts-expect-error
            const result = countUniqueEmojisInNotes([null]);
            expect(result).toEqual([]);
        });

        it("returns an empty array if the notes are empty strings", () => {
            const result = countUniqueEmojisInNotes([{ notes: "" }]);
            expect(result).toEqual([]);
        });

        it("returns an empty array if the notes are an empty array", () => {
            const result = countUniqueEmojisInNotes([]);
            expect(result).toEqual([]);
        });
    });
});
