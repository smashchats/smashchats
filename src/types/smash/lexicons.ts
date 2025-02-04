import { IMProtoMessage, sha256, undefinedString } from "@smashchats/library";

export declare const SMASH_MEDIA = "com.smashchats.media";
export declare const SMASH_MEDIA_PHOTO = "com.smashchats.media.photo";
export declare const SMASH_MEDIA_VIDEO = "com.smashchats.media.video";

export interface SmashMediaMessage extends IMProtoMessage {
    type: `${typeof SMASH_MEDIA}.${string}`;
    data: {};
}

export class SmashMediaPhotoMessage implements SmashMediaMessage {
    public type = SMASH_MEDIA_PHOTO as typeof SMASH_MEDIA_PHOTO;
    constructor(
        public data: {
            base64: string;
            mimeType: string;
        },
        public after: sha256 | undefinedString = ""
    ) {}
}

export class SmashMediaVideoMessage implements SmashMediaMessage {
    public type = SMASH_MEDIA_VIDEO as typeof SMASH_MEDIA_VIDEO;
    constructor(
        public data: {
            base64: string;
            mimeType: string;
            muted: boolean;
        },
        public after: sha256 | undefinedString = ""
    ) {}
}
