import * as FileSystem from "expo-file-system";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";

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

export const saveMedia = async (
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

    // Generate a unique filename
    const mediaHash = uuidv7();
    const fileExtension = mimeType.split("/")[1];
    const filePath = `${MEDIA_DIR}${mediaHash}.${fileExtension}`;

    // Save the media file
    await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
    });

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
        throw new Error("Failed to save media file");
    }

    let thumbnailPath: string | undefined;
    if (options.generateThumbnail && mediaType === "video") {
        // For videos, we'll generate a thumbnail
        // Note: This is a placeholder - you'll need to implement actual video thumbnail generation
        // You might want to use a library like react-native-video-thumbnails
        thumbnailPath = `${THUMBNAILS_DIR}${mediaHash}.jpg`;
    }

    // Save metadata to database
    const metadata: MediaMetadata = {
        sha256: mediaHash,
        file_path: filePath,
        mime_type: mimeType,
        media_type: mediaType,
        width: options.width,
        height: options.height,
        duration: options.duration,
        size: 0, // We'll need to implement a way to get file size
        thumbnail_path: thumbnailPath,
    };

    await drizzle_db.insert(media).values({
        ...metadata,
        media_type: mediaType as string, // Type assertion needed for database schema
    });

    return metadata;
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

export const getMediaUri = async (
    mediaHash: string
): Promise<string | null> => {
    const metadata = await getMedia(mediaHash);
    if (!metadata) return null;

    const fileInfo = await FileSystem.getInfoAsync(metadata.file_path);
    if (!fileInfo.exists) return null;

    return metadata.file_path;
};

export const getThumbnailUri = async (
    mediaHash: string
): Promise<string | null> => {
    const metadata = await getMedia(mediaHash);
    if (!metadata?.thumbnail_path) return null;

    const fileInfo = await FileSystem.getInfoAsync(metadata.thumbnail_path);
    if (!fileInfo.exists) return null;

    return metadata.thumbnail_path;
};

export const deleteMedia = async (mediaHash: string): Promise<void> => {
    const metadata = await getMedia(mediaHash);
    if (metadata) {
        // Delete the main file
        await FileSystem.deleteAsync(metadata.file_path, { idempotent: true });

        // Delete thumbnail if it exists
        if (metadata.thumbnail_path) {
            await FileSystem.deleteAsync(metadata.thumbnail_path, {
                idempotent: true,
            });
        }

        // Delete from database
        await drizzle_db.delete(media).where(eq(media.sha256, mediaHash));
    }
};

export const cleanupUnusedMedia = async (): Promise<void> => {
    // Get all media from database
    const allMedia = await drizzle_db.select().from(media);

    // Check each media file
    for (const mediaItem of allMedia) {
        const fileInfo = await FileSystem.getInfoAsync(mediaItem.file_path);
        if (!fileInfo.exists) {
            // File doesn't exist, remove from database
            await drizzle_db
                .delete(media)
                .where(eq(media.sha256, mediaItem.sha256));
        }
    }
};

// Helper function to determine media type from mime type
export const getMediaTypeFromMimeType = (mimeType: string): MediaType => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    throw new Error(`Unsupported mime type: ${mimeType}`);
};
