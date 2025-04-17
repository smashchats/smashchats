import { getOrCreateIdentity } from "@/src/utils/IdentityUtils";
import { DIDDocManager, Logger, SmashMessaging } from "@smashchats/library";

const logger = new Logger("test");

const MOCK_IDENTITY = {
    createdAt: "2025-03-22T16:10:01.170Z",
    exchangeKey: {
        privateKey: {
            jwk: {
                key_ops: ["deriveKey", "deriveBits"],
                ext: true,
                kty: "EC",
                x: "hbfTTsc2nW8Qje7VNuyGPyJSGMZQ0n3BVi5cGBUyihY",
                y: "0n7bt04FF9eX5KK8Cm_a7n_-hHKyBCCk1yHCGzvkudU",
                crv: "P-256",
                d: "orC0QtTSIB_qsJqKBixOKNh_3ZKGxdBB2mHHdu1rnKI",
            },
            algorithm: {
                name: "ECDH",
                namedCurve: "P-256",
            },
            usages: ["deriveKey", "deriveBits"],
            extractable: true,
            type: "private",
        },
        publicKey: {
            jwk: {
                key_ops: [],
                ext: true,
                kty: "EC",
                x: "hbfTTsc2nW8Qje7VNuyGPyJSGMZQ0n3BVi5cGBUyihY",
                y: "0n7bt04FF9eX5KK8Cm_a7n_-hHKyBCCk1yHCGzvkudU",
                crv: "P-256",
            },
            algorithm: {
                name: "ECDH",
                namedCurve: "P-256",
            },
            usages: [],
            extractable: true,
            type: "public",
        },
        thumbprint:
            "d081fe833f8109c1d154b6a4c38de85383a20b764219e078c43b2d08dab1a1de",
    },
    id: 0,
    preKeys: [],
    signedPreKeys: [],
    signingKey: {
        privateKey: {
            jwk: {
                key_ops: ["sign"],
                ext: true,
                kty: "EC",
                x: "_HoOmmrFHlsO_VEFAdySWuOZugN7XtVQBHZjxjIrMxQ",
                y: "Nm-jZymd2r0WuzRnoLxORCiDOqYlR1BhCbu7Pjr7msw",
                crv: "P-256",
                d: "Bf_PVjorPR-V3w1Xkfh-qFZV21OpcgfftXZ6f9Eze8o",
            },
            algorithm: {
                name: "ECDSA",
                namedCurve: "P-256",
            },
            usages: ["sign"],
            extractable: true,
            type: "private",
        },
        publicKey: {
            jwk: {
                key_ops: ["verify"],
                ext: true,
                kty: "EC",
                x: "_HoOmmrFHlsO_VEFAdySWuOZugN7XtVQBHZjxjIrMxQ",
                y: "Nm-jZymd2r0WuzRnoLxORCiDOqYlR1BhCbu7Pjr7msw",
                crv: "P-256",
            },
            algorithm: {
                name: "ECDSA",
                namedCurve: "P-256",
            },
            usages: ["verify"],
            extractable: true,
            type: "public",
        },
        thumbprint:
            "71335f0144d8a498f5a23c1e4edbffda584ca90c1a383d1825aff78d3f566919",
    },
    did: "did:doc:71335f0144d8a498f5a23c1e4edbffda584ca90c1a383d1825aff78d3f566919",
    endpoints: [],
};

jest.mock("@/src/utils/StorageUtils");

describe("IdentityUtils", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getOrCreateIdentity", () => {
        it("should create a new identity", async () => {
            const didDocumentManager = new DIDDocManager();
            SmashMessaging.use(didDocumentManager);
            SmashMessaging.setCrypto(window.crypto);

            const { getData } = require("@/src/utils/StorageUtils");
            (getData as jest.Mock).mockResolvedValue(null);

            const spy = jest.spyOn(didDocumentManager, "generate");

            const identity = await getOrCreateIdentity(
                didDocumentManager,
                logger
            );

            expect(identity).toBeDefined();
            expect(spy).toHaveBeenCalled();
        });

        it("should load an existing identity", async () => {
            const didDocumentManager = new DIDDocManager();
            SmashMessaging.use(didDocumentManager);
            SmashMessaging.setCrypto(window.crypto);

            const { getData } = require("@/src/utils/StorageUtils");
            (getData as jest.Mock).mockResolvedValue(MOCK_IDENTITY);

            const spy = jest.spyOn(didDocumentManager, "generate");

            const identity = await getOrCreateIdentity(
                didDocumentManager,
                logger
            );

            expect(spy).not.toHaveBeenCalled();
            expect(identity).toBeDefined();
        });
    });
});
