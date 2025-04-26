import * as FileSystem from "expo-file-system";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import * as VideoThumbnails from "expo-video-thumbnails";

import { drizzle_db } from "@/src/db/database";
import { media } from "@/src/db/schema";

const MEDIA_DIR = `${FileSystem.documentDirectory}media/`;
const THUMBNAILS_DIR = `${MEDIA_DIR}thumbnails/`;

export type MediaType = "image" | "video" | "audio";

export interface MediaMetadata {
    sha256: string;
    file_path: string;
    mime_type: string;
    media_type: MediaType;
    width?: number;
    height?: number;
    duration?: number;
    size: number;
    thumbnail_path?: string;
}

export const ensureMediaDirectories = async () => {
    const dirInfo = await FileSystem.getInfoAsync(MEDIA_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
    }

    const thumbnailsDirInfo = await FileSystem.getInfoAsync(THUMBNAILS_DIR);
    if (!thumbnailsDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(THUMBNAILS_DIR, {
            intermediates: true,
        });
    }
};

const generateUniqueFilePath = (mimeType: string): string => {
    const mediaHash = uuidv7();
    const fileExtension = mimeType.split("/")[1];
    return `${MEDIA_DIR}${mediaHash}.${fileExtension}`;
};

const generateVideoThumbnail = async (filePath: string, mediaHash: string): Promise<string | undefined> => {
    try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(filePath);
        const thumbnailPath = `${THUMBNAILS_DIR}${mediaHash}.jpg`;
        await FileSystem.copyAsync({
            from: uri,
            to: thumbnailPath,
        });
        return thumbnailPath;
    } catch (error) {
        console.warn("Failed to generate video thumbnail:", error);
        return undefined;
    }
};

export const saveMediaFromBase64 = async (
    base64Data: string,
    mimeType: string,
    mediaType: MediaType,
    options: {
        width?: number;
        height?: number;
        duration?: number;
        generateThumbnail?: boolean;
    } = {}
): Promise<MediaMetadata> => {
    await ensureMediaDirectories();

    const filePath = generateUniqueFilePath(mimeType);
    const mediaHash = filePath.split("/").pop()?.split(".")[0] || "";

    await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
    });

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
        throw new Error("Failed to save media file");
    }

    let thumbnailPath: string | undefined;
    if (options.generateThumbnail && mediaType === "video") {
        thumbnailPath = await generateVideoThumbnail(filePath, mediaHash);
    }

    const metadata: MediaMetadata = {
        sha256: mediaHash,
        file_path: filePath,
        mime_type: mimeType,
        media_type: mediaType,
        width: options.width,
        height: options.height,
        duration: options.duration,
        size: fileInfo.size || 0,
        thumbnail_path: thumbnailPath,
    };

    await drizzle_db.insert(media).values({
        ...metadata,
        media_type: mediaType as string,
    });

    return metadata;
};

export const saveMediaFromUri = async (
    uri: string,
    mimeType: string,
    mediaType: MediaType,
    options: {
        width?: number;
        height?: number;
        duration?: number;
        generateThumbnail?: boolean;
    } = {}
): Promise<MediaMetadata> => {
    await ensureMediaDirectories();

    const filePath = generateUniqueFilePath(mimeType);
    const mediaHash = filePath.split("/").pop()?.split(".")[0] ?? "";

    await FileSystem.copyAsync({
        from: uri,
        to: filePath,
    });

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
        throw new Error("Failed to save media file");
    }

    let thumbnailPath: string | undefined;
    if (options.generateThumbnail && mediaType === "video") {
        thumbnailPath = await generateVideoThumbnail(filePath, mediaHash);
    }

    const metadata: MediaMetadata = {
        sha256: mediaHash,
        file_path: filePath,
        mime_type: mimeType,
        media_type: mediaType,
        width: options.width,
        height: options.height,
        duration: options.duration,
        size: fileInfo.size || 0,
        thumbnail_path: thumbnailPath,
    };

    await drizzle_db.insert(media).values({
        ...metadata,
        media_type: mediaType as string,
    });

    return metadata;
};

export const getMediaBytes = async (
    filePath: string
): Promise<string | null> => {
    try {
        const base64Data = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return base64Data;
    } catch (error) {
        console.error("Failed to read media file:", error);
        return null;
    }
};

export const getMedia = async (
    mediaHash: string
): Promise<MediaMetadata | null> => {
    const result = await drizzle_db
        .select()
        .from(media)
        .where(eq(media.sha256, mediaHash))
        .limit(1);

    if (!result[0]) return null;

    return {
        sha256: result[0].sha256,
        file_path: result[0].file_path,
        mime_type: result[0].mime_type,
        media_type: result[0].media_type as MediaType,
        width: result[0].width ?? undefined,
        height: result[0].height ?? undefined,
        duration: result[0].duration ?? undefined,
        size: result[0].size,
        thumbnail_path: result[0].thumbnail_path ?? undefined,
    };
};

export const getMediaTypeFromMimeType = (mimeType: string): MediaType => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    throw new Error(`Unsupported mime type: ${mimeType}`);
};
