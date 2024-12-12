import { EventBase } from "@/src/events/types.js";

export type MetadataType = "ReceivedReceiptMetadata" | "ReadReceiptMetadata";

export interface MetadataEvent extends EventBase {
    type: MetadataType;
    uid: string;
    messageId: string;
}

export interface ReceivedReceiptMetadata extends MetadataEvent {
    type: "ReceivedReceiptMetadata";
}

export interface ReadReceiptMetadata extends MetadataEvent {
    type: "ReadReceiptMetadata";
}
