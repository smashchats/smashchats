import React from "react";

import { IM_CHAT_TEXT } from "@smashchats/library";

import { Box } from "@/src/components/design-system/Box";
import ProfileMessagesScreenText from "@/src/components/ProfileMessagesScreenText";
import ProfileMessagesScreenDate from "@/src/components/ProfileMessagesScreenDate";
import ProfileMessagesScreenMetadata from "@/src/components/ProfileMessagesScreenMetadata";
import { DisplayableMessage } from "@/src/types/";
import ProfileMessagesScreenUnreadMessages from "@/src/components/ProfileMessagesScreenUnreadMessages";

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
        case "profile":
            return <Box />;
        case "profiles":
            return (
                <ProfileMessagesScreenText
                    message={{
                        ...message,
                        content: "Several profiles [...]",
                    }}
                />
            );
        default:
            return <Box />;
    }
};
