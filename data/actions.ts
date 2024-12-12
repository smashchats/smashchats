import {
    SmashUserAction,
    TrustUserAction,
} from "@/src/events/shared_with_server_admin.js";

export const SMASH_USER = (uid: string): SmashUserAction => ({
    type: "SmashedUser",
    timestamp: new Date("2010"),
    uid: `${uid}-uuid`,
    generatedBy: "me-uuid",
});

export const TRUST_USER = (uid: string): TrustUserAction => ({
    type: "TrustedUser",
    timestamp: new Date("2015"),
    uid: `${uid}-uuid`,
    generatedBy: "me-uuid",
});
