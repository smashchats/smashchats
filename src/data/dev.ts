import { JoinAction } from "smash-node-lib";

// sme.dev.smashchats.com

export const dev_nab_join_action: JoinAction = {
    action: "join",
    did: {
        id: "4TuFHgRIGyVnUpyzzGBavr/y1B4U4+Dafpk2JXC/CcU=",
        ik: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEy7VvSuWTLgBgezLOO9z0ERYEt0IJXhEFizv7W8SgcXVr9tUpGmgjnYexHEj/vuMnrr8W4kGJXrHpjxdUgZ9Zyw==",
        ek: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEwS45QAbB5UY6God+zv1UubpGz7lMzO2MqzpwRjnlEYXooeYBE1o4GGZ+D6RmDtobYgLrFLtjIW1kNpUVdUnqag==",
        signature:
            "o7wATFmPdlpAuCyV07fDulaUuKEYm/sv5O59P+UxH71fyJXfOX4vW5eFLgQDaO10pIgyY2EXihA2Nwwzxv3j8w==",
        endpoints: [
            {
                url: "wss://sme.dev.smashchats.com/",
                preKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElaILnj3pFSoqe8oZGc0Jx9pd8l4tBeEydCkMx9GTDxrI4j7R7dDd1PhVBk6YF6T+k8N5e7Es1aW60gzE41MgQQ==",
                signature:
                    "jTQk0mz0LzzWCQrhTdCi/ta53JiywIWEkgmVzpydhiAg13LX58FyUL4Fw176xWMds7zKp/mOKWySHJTO/lee+A==",
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
                },
            },
        ],
    },
};
