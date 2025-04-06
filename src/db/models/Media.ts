import { media, messages } from "@/src/db/schema";
import { asc, and, eq, isNotNull, InferInsertModel, InferSelectModel } from "drizzle-orm";

import { drizzle_db } from "@/src/db/database";
import { MediaType } from "@/src/utils/MediaStorage";

export type Media = InferSelectModel<typeof media>;
export type MediaInsert = InferInsertModel<typeof media>;

export const getAllMediaInDiscussion = async (
    discussionId: string
): Promise<Media[]> => {
    console.debug("getAllMediaInDiscussion", discussionId);
    const results = (await drizzle_db
        .select({
            media: media,
        })
        .from(messages)
        .leftJoin(media, eq(messages.sha256, media.sha256))
        .where(
            and(
                eq(messages.discussion_id, discussionId),
                isNotNull(media.sha256)
            )
        )
        .orderBy(asc(messages.created_at))
        .execute()) as { media: Media }[];

    return results.map(({ media }) => {
        return {
            sha256: media.sha256,
            file_path: media.file_path,
            mime_type: media.mime_type,
            media_type: media.media_type as MediaType,
            width: media.width ?? null,
            height: media.height ?? null,
            duration: media.duration ?? null,
            size: media.size,
            thumbnail_path: media.thumbnail_path ?? null,
        } as Media;
    });
};
