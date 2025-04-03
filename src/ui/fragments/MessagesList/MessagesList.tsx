import React from "react";

import { IM_CHAT_TEXT } from "@smashchats/library";

import {
    ProfileMessagesScreenDate,
    ProfileMessagesScreenMetadata,
    ProfileMessagesScreenText,
    ProfileMessagesScreenUnreadMessages,
    ProfileMessagesScreenMedia,
} from "@/src/ui/components/ProfileMessagesScreen";
import { DisplayableMessage } from "@/src/types/";
import {
    SMASH_MEDIA_PHOTO,
    SMASH_MEDIA_VIDEO,
} from "@/src/types/smash/lexicons";

export const RenderMessageListItem = ({
    message,
}: {
    message: DisplayableMessage;
}) => {
    switch (message.type) {
        case IM_CHAT_TEXT:
            return <ProfileMessagesScreenText message={message} />;
        case "system-date":
            return <ProfileMessagesScreenDate date={message.date} />;
        case "system-unread":
            return (
                <ProfileMessagesScreenUnreadMessages
                    message={`${message.content} unread message${
                        (message.content as number) === 1 ? "" : "s"
                    }`}
                />
            );
        case "metadata":
            return <ProfileMessagesScreenMetadata message={message} />;
        case SMASH_MEDIA_PHOTO:
        case SMASH_MEDIA_VIDEO:
            return (
                <ProfileMessagesScreenMedia
                    message={
                        message as unknown as DisplayableMessage & {
                            data: string;
                        }
                    }
                />
            );
        default:
            return (
                <ProfileMessagesScreenMetadata
                    message={
                        {
                            content: "Unknown",
                            type: "system-unknown",
                        } as DisplayableMessage
                    }
                />
            );
    }
};
