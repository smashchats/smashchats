import { DIDString, EncapsulatedIMProtoMessage } from "@smashchats/library";

export * from "./DiscussionScreen.types";
export * from "./ChatListScreen.types";
export * from "./Utils.types";

export type PartialWithId<T extends { id: string }> = Partial<T> & Pick<T, 'id'>;

export interface EnrichedSmashMessage extends EncapsulatedIMProtoMessage {
    fromDid: DIDString;
    toDiscussionId: DIDString;
}
