import { EventBase } from "@/src/events/types.js";

export type ActionType = "SmashedUser" | "TrustedUser";

export interface SharedWithServerAdminUserEvent extends EventBase {
    type: ActionType;
    uid: string;
}

export interface SmashUserAction extends SharedWithServerAdminUserEvent {
    type: "SmashedUser";
}

export interface TrustUserAction extends SharedWithServerAdminUserEvent {
    type: "TrustedUser";
}
