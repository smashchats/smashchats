import { IMEncapsulatedMessage } from "@smashchats/library";

export type EncapsulatedMessage<T> = IMEncapsulatedMessage & T;
