import { DIDDocument, SMASH_NBH_JOIN, SmashActionJson, DIDString } from "@smashchats/library";

// sme.dev.smashchats.com

export const dev_nab_join_action: SmashActionJson = {
    action: SMASH_NBH_JOIN,
    did: {
        // @ts-expect-error
        id: "ZIsYX5VG4YYsRoZHXjqgP6qxiuJPA+2VHDsyaelBgsY=",
        ik: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE+xdYcQA4u/V9XNVtcJYRIS81sFmuDFjmJY3wI+Cek6tDwAB3s+SaI+Dt7BYYI0t/5Q/DpyyE3mU/jh+8exXePw==",
        ek: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEI2H2O9WR3mFvKKyARRx022LI7XpgjId/xh+YZOq59kQstZMdXQ6BiIMcRgs5ZmPERaB56LBOn4BVOGmDEt1AzA==",
        signature: "Y5An8lEcc6dgZRD9u4ucFS0jaQ7RuhGQ1OhcRn6idxX5kLyLpp6CtMAvtDwtn1SpCKxD8Ue1qlzuLUMlBaahjw==",
        endpoints: [
            {
                url: "wss://sme.dev.smashchats.com/",
                preKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAERLj1hG01chiLksY1iTygZsKXJgr9Ih/V8eiWAWww7RK5sSC7PMRykkoIZ3K6EBPebLSLlXe6HMNNlGdkqvn2Vw==",
                signature: "DQO+FqS3bDYVKO4KBhIXhAp6e3cXuvUKzLIvvNYi9++P9YiJmmfqqg5CvZcqOqiBnsRnFU9DzEXTMrAdSqkcFQ=="
            },
        ],
    },
    config: {
        sme: [
            {
                url: "wss://sme.dev.smashchats.com/",
                smePublicKey:
                    "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEW45b75uMszTovqQSUDhsofhJx78A4Ytm4KV+REh2RRxwwfXVzTOmApNGU+eSoS2kEeDIpgt5ymLj5XPkVuEx+Q==",
                keyAlgorithm: {
                    name: "ECDH",
                    namedCurve: "P-256",
                } as KeyAlgorithm,
                encryptionAlgorithm: {
                    name: "AES-GCM",
                    length: 256,
                }
            }
        ]
    }
}

export const didId = (dev_nab_join_action.did as DIDDocument).id as DIDString;
