import {
    DIDDocumentSchema,
    DidStringSchema,
    SmashEndpointSchema,
} from "@/src/utils/schemas/didSchema";

describe("DidStringSchema", () => {
    it("should validate a valid DID string", () => {
        const did = "did:key:123";
        const result = DidStringSchema.parse(did);
        expect(result).toBe(did);
    });

    it("should throw an error for an invalid DID string", () => {
        const did = "did:key:";
        expect(() => DidStringSchema.parse(did)).toThrow();
    });

    it("should throw an error for an invalid DID string length", () => {
        const did = "did:key:123:456";
        expect(() => DidStringSchema.parse(did)).toThrow();
    });

    it("should throw an error for an invalid method in a DID string", () => {
        const did = "did:aaa:123";
        expect(() => DidStringSchema.parse(did)).toThrow();
    });
});

describe("SmashEndpointSchema", () => {
    it("should validate a valid SmashEndpoint", () => {
        const endpoint = {
            url: "https://example.com",
            preKey: "123",
            signature: "456",
        };
        const result = SmashEndpointSchema.parse(endpoint);
        expect(result).toStrictEqual(endpoint);
    });

    it("should throw an error for an invalid SmashEndpoint", () => {
        const endpoint = {
            url: "https://example.com",
        };
        expect(() => SmashEndpointSchema.parse(endpoint)).toThrow();
    });

    it("should validate a valid SmashEndpoint as stringified JSON", () => {
        const endpoint = {
            url: "https://example.com",
            preKey: "123",
            signature: "456",
        };
        const result = SmashEndpointSchema.parse(JSON.stringify(endpoint));
        expect(result).toStrictEqual(endpoint);
    });

    it("should throw an error for an invalid SmashEndpoint as stringified JSON", () => {
        const endpoint = {
            url: "https://example.com",
        };
        expect(() =>
            SmashEndpointSchema.parse(JSON.stringify(endpoint))
        ).toThrow();
    });
});

describe("DIDDocumentSchema", () => {
    it("should validate a valid DIDDocument", () => {
        const didDocument = {
            id: "did:key:123",
            ik: "123",
            ek: "456",
            signature: "789",
            endpoints: [
                {
                    url: "https://example.com",
                    preKey: "123",
                    signature: "456",
                },
            ],
        };
        const result = DIDDocumentSchema.parse(didDocument);
        expect(result).toStrictEqual(didDocument);
    });

    it("should throw an error for an invalid DIDDocument", () => {
        const didDocument = {
            id: "did:key:123",
        };
        expect(() => DIDDocumentSchema.parse(didDocument)).toThrow();
    });

    it("should validate a valid DIDDocument as stringified JSON", () => {
        const didDocument = {
            id: "did:key:123",
            ik: "123",
            ek: "456",
            signature: "789",
            endpoints: [
                {
                    url: "https://example.com",
                    preKey: "123",
                    signature: "456",
                },
            ],
        };
        const result = DIDDocumentSchema.parse(JSON.stringify(didDocument));
        expect(result).toStrictEqual(didDocument);
    });

    it("should throw an error for an invalid DIDDocument as stringified JSON", () => {
        const didDocument = {
            id: "did:key:123",
        };
        expect(() =>
            DIDDocumentSchema.parse(JSON.stringify(didDocument))
        ).toThrow();
    });
});
