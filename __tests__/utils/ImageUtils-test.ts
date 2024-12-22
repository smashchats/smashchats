import { convertImageToBase64 } from "@/src/utils/ImageUtils";

import * as FileSystem from "expo-file-system";
import { readAsStringAsync } from "expo-file-system";

jest.mock('expo-file-system', () => ({
    readAsStringAsync: jest.fn(),
    EncodingType: {
        Base64: "base64"
    }
}));

beforeEach(() => {
    (readAsStringAsync as jest.Mock).mockClear();
});

describe("convertImageToBase64", () => {
    beforeEach(() => {
        jest.spyOn(FileSystem, "readAsStringAsync").mockResolvedValue("test-base64-data");
    });
    it("returns the base64 data of an image", async () => {
        const base64Data = await convertImageToBase64("test.png");

        expect(readAsStringAsync).toHaveBeenCalledWith("test.png", {
            encoding: FileSystem.EncodingType.Base64,
        });

        expect(base64Data).toBe("test-base64-data");

    })
})