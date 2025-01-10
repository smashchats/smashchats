import React from "react";

import { IM_CHAT_TEXT } from "@smashchats/library";

import { Box } from "@/src/ui/design-system/layout";
import {
    ProfileMessagesScreenDate,
    ProfileMessagesScreenMetadata,
    ProfileMessagesScreenText,
    ProfileMessagesScreenUnreadMessages,
} from "@/src/ui/components/ProfileMessagesScreen";
import { DisplayableMessage } from "@/src/types/";

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
        default:
            return <Box />;
    }
};
