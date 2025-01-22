import { DIDDocManager, DIDDocument, DIDString, IMProfile, SmashEndpoint, SmashMessaging, SmashProfileList } from "@smashchats/library";
import { Contact } from "@/src/db/models/Contacts";
import { MapContactToDidDocument, MapDidToContactInsert, ResolveDidAndMapToContactInsert, SmashProfileToContactMapper } from "@/src/utils/mappers/contacts";

const did: DIDDocument = {
    id: 'did:test:123' as DIDString,
    ik: 'ik123',
    ek: 'ek123',
    signature: 'sig123',
    endpoints: [{ url: "endpoint1" }] as SmashEndpoint[]
}

describe("contact mappers", () => {
    let didManager: DIDDocManager;
    beforeEach(() => {
        didManager = new DIDDocManager();
        Object.defineProperty(didManager, 'method', {
            value: 'test',
            writable: false,
        });
        SmashMessaging.use(didManager);
    });

    describe("SmashProfileToContactMapper", () => {
        it("maps profile to contact", async () => {
            const profile: SmashProfileList[0] = {
                did,
                meta: {
                    title: "Test Title",
                    description: "Test Description",
                    avatar: "avatar.jpg"
                } as IMProfile
            };

            const result = await SmashProfileToContactMapper(profile);

            expect(result).toEqual({
                did_id: "did:test:123",
                did_ik: "ik123",
                did_ek: "ek123",
                did_signature: "sig123",
                did_endpoints: [{ url: "endpoint1" }],
                meta_title: "Test Title",
                meta_description: "Test Description",
                meta_avatar: "avatar.jpg"
            });
        });

        it("handles missing optional fields", async () => {
            const profile = {
                did: {
                    id: "did:test:123" as DIDString,
                    ik: "ik123",
                    ek: "ek123",
                    signature: "sig123"
                },
            } as SmashProfileList[0];

            const result = await SmashProfileToContactMapper(profile);

            expect(result.did_endpoints).toEqual([]);
            expect(result.meta_title).toBeUndefined();
            expect(result.meta_description).toBeUndefined();
            expect(result.meta_avatar).toBeUndefined();
        });
    });

    describe("MapContactToDid", () => {
        it("maps contact to DID document", () => {
            const contact: Contact = {
                did_id: "did:test:123" as DIDString,
                did_ik: "ik123",
                did_ek: "ek123",
                did_signature: "sig123",
                did_endpoints: [{ url: "endpoint1" }] as SmashEndpoint[],
                created_at: new Date(),
                updated_at: new Date()
            } as Contact;

            const result = MapContactToDidDocument(contact);

            expect(result).toEqual({
                id: "did:test:123",
                ik: "ik123",
                ek: "ek123",
                signature: "sig123",
                endpoints: [{ url: "endpoint1" }]
            });
        });

        it("handles missing endpoints", () => {
            const contact: Contact = {
                did_id: "did:test:123" as DIDString,
                did_ik: "ik123",
                did_ek: "ek123",
                did_signature: "sig123",
                did_endpoints: null,
                created_at: new Date(),
                updated_at: new Date()
            } as Contact;

            const result = MapContactToDidDocument(contact);

            expect(result.endpoints).toEqual([]);
        });
    });

    describe("MapDidToContact", () => {
        it("maps DID document to contact", () => {
            const result = MapDidToContactInsert(did);

            expect(result).toEqual({
                did_id: "did:test:123",
                did_ik: "ik123",
                did_ek: "ek123",
                did_signature: "sig123",
                did_endpoints: [{ url: "endpoint1" }]
            });
        });
    });

    describe("MapImProfileToPartialDidDocument", () => {
        it("maps IMProfile to Partial<DIDDocument>", async () => {
            const profile: IMProfile = {
                did: { id: "did:test:123" as DIDString }
            } as IMProfile;

            const result = await ResolveDidAndMapToContactInsert(profile);

            expect(result).toEqual(expect.objectContaining({ did_id: "did:test:123" }));
        });
    });
});