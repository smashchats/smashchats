import { addPrefixToObjectKeys, getDidFromDomain } from "@/src/utils/Utils";

describe("Utils", () => {
    describe("getDidFromDomain", () => {
        beforeEach(() => {
            const mockedJson = () =>
                Promise.resolve({
                    Status: 0,
                    Answer: [
                        {
                            name: "_smash.smash.chat",
                            type: 16,
                            data: {
                                id: "did:smash:test",
                                ik: "test-ik",
                                ek: "test-ek",
                                signature: "test-signature",
                                endpoints: [],
                            },
                        },
                    ],
                });
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: mockedJson,
                })
            ) as jest.Mock;
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it("returns the DIDDocument for a given domain", async () => {
            const didDocument = await getDidFromDomain("smash.chat");
            expect(didDocument).toStrictEqual({
                id: "did:smash:test",
                ik: "test-ik",
                ek: "test-ek",
                signature: "test-signature",
                endpoints: [],
            });

            expect(global.fetch).toHaveBeenCalledWith(
                "https://dns.google/resolve?name=_smash.smash.chat&type=TXT",
                {
                    headers: { "Content-Type": "application/dns-json" },
                }
            );
        });
    });

    describe("addPrefixToObjectKeys", () => {
        it("adds a prefix to the keys of an object", () => {
            const obj = { a: 1, b: 2, c: 3 };
            const prefix = "prefix-";
            const result = addPrefixToObjectKeys(obj, prefix);
            expect(result).toEqual({
                "prefix-a": 1,
                "prefix-b": 2,
                "prefix-c": 3,
            });
        });
    });
});
