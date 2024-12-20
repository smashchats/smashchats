import { DIDDocument, DIDString, IMProfile, SmashEndpoint, SmashProfileList } from "@smashchats/library";
import { Contact } from "@/src/db/models/Contacts";
import { MapContactToDid, MapDidToContact, SmashProfileToContactMapper } from "@/src/utils/mappers/contacts";

describe("contact mappers", () => {
    describe("SmashProfileToContactMapper", () => {
        it("maps profile to contact", () => {
            const profile: SmashProfileList[0] = {
                did: {
                    id: "did:123" as DIDString,
                    ik: "ik123",
                    ek: "ek123",
                    signature: "sig123",
                    endpoints: [{ url: "endpoint1" }] as SmashEndpoint[]
                },
                meta: {
                    title: "Test Title",
                    description: "Test Description",
                    avatar: "avatar.jpg"
                } as IMProfile
            };

            const result = SmashProfileToContactMapper(profile);

            expect(result).toEqual({
                did_id: "did:123",
                did_ik: "ik123",
                did_ek: "ek123",
                did_signature: "sig123",
                did_endpoints: [{ url: "endpoint1" }],
                meta_title: "Test Title",
                meta_description: "Test Description",
                meta_avatar: "avatar.jpg"
            });
        });

        it("handles missing optional fields", () => {
            const profile = {
                did: {
                    id: "did:123" as DIDString,
                    ik: "ik123",
                    ek: "ek123",
                    signature: "sig123"
                },
            } as SmashProfileList[0];

            const result = SmashProfileToContactMapper(profile);

            expect(result.did_endpoints).toEqual([]);
            expect(result.meta_title).toBeUndefined();
            expect(result.meta_description).toBeUndefined();
            expect(result.meta_avatar).toBeUndefined();
        });
    });

    describe("MapContactToDid", () => {
        it("maps contact to DID document", () => {
            const contact: Contact = {
                did_id: "did:123" as DIDString,
                did_ik: "ik123",
                did_ek: "ek123",
                did_signature: "sig123",
                did_endpoints: [{ url: "endpoint1" }] as SmashEndpoint[],
                created_at: new Date(),
                updated_at: new Date()
            } as Contact;

            const result = MapContactToDid(contact);

            expect(result).toEqual({
                id: "did:123",
                ik: "ik123",
                ek: "ek123",
                signature: "sig123",
                endpoints: [{ url: "endpoint1" }]
            });
        });

        it("handles missing endpoints", () => {
            const contact: Contact = {
                did_id: "did:123" as DIDString,
                did_ik: "ik123",
                did_ek: "ek123",
                did_signature: "sig123",
                did_endpoints: null,
                created_at: new Date(),
                updated_at: new Date()
            } as Contact;

            const result = MapContactToDid(contact);

            expect(result.endpoints).toEqual([]);
        });
    });

    describe("MapDidToContact", () => {
        it("maps DID document to contact", () => {
            const did: DIDDocument = {
                id: "did:123" as DIDString,
                ik: "ik123",
                ek: "ek123",
                signature: "sig123",
                endpoints: [{ url: "endpoint1" }] as SmashEndpoint[]
            };

            const result = MapDidToContact(did);

            expect(result).toEqual({
                did_id: "did:123",
                did_ik: "ik123",
                did_ek: "ek123",
                did_signature: "sig123",
                did_endpoints: [{ url: "endpoint1" }]
            });
        });
    });
});
