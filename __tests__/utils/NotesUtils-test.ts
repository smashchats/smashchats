import { extractEmojisFromText } from "@/src/utils/NotesUtils";

describe("extractEmojisFromText", () => {
    it("returns an array of emojis", () => {
        const result = extractEmojisFromText("This is a test message with an emoji 👋");
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
