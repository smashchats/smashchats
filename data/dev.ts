import { DIDDocument, SMASH_NBH_JOIN, SmashActionJson } from "@smashchats/library";

// sme.dev.smashchats.com

export const dev_nab_join_action: SmashActionJson = {
    action: SMASH_NBH_JOIN,
    did: {
        id: "did:doc:4f564575546bda55c8ce9004d82cfa3b2258c81d9114c5910662a8a3d9918673",
        ik: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEkJe/dNZh48NYacBBKkCAdySIZ6NIhpRw+cSakysNozr8Ze8SZMqLCgLYksZlbO2ClzKANlgBSWlM2nj1o7kBUw==",
        ek: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEozJwLAXtOj8pBldKzVx3lCgPEHkb6a/Q5hDwy3s832PiomBUGRmJwaTjcIKNau9Sbf3eZ1XPiE6HI33FzK2bHA==",
        signature: "ZvTG9wRzaPydtuLi/GSl/kHmVQA5RC/EDeMEkMngRVWVmpqeE7PSI32ANNjxLUALHRhOiHI1rcymAnTvPqULsg==",
        endpoints: [
            {
                url: "wss://sme.dev.smashchats.com/",
                preKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEOs/pLYvdqO1gmHUMMXK6iujynHOZEPZWc94O8QPDddnTAACIKduZGc8JfxUx/ZDq8tlaMHV8l9c2VvSr3C+jMg==",
                signature: "L56lvk91VxmS6LXXfwQZqqMUdmReiLIrBJgCetRnsVBxtql7zguDYACHUUcccdQmPOG9YBice9gbvaQB+oeRZA=="
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
                },
                encryptionAlgorithm: {
                    name: "AES-GCM",
                    length: 256,
                }
            }
        ]
    }
}

export const didId = (dev_nab_join_action.did as DIDDocument).id;
