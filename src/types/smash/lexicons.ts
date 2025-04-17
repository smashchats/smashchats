import { EncapsulatedIMProtoMessage } from "@smashchats/library";

export type EncapsulatedMessage<T> = EncapsulatedIMProtoMessage & T;
