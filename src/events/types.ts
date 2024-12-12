import { MetadataType } from "@/src/events/metadata.js";
import { ActionType } from "@/src/events/shared_with_server_admin.js";
import { UserGeneratedEventType } from "@/src/events/user_generated.js";

export type UUID = string;

export interface EventBase {
    type: UserGeneratedEventType | ActionType | MetadataType;
    timestamp: Date;
    generatedBy: UUID;
}
