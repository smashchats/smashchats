import React from "react";
import { View } from "react-native";

import { Box } from "@/src/components/design-system/Box";
import ProfileMessagesScreenText from "@/src/components/ProfileMessagesScreenText";
import ProfileMessagesScreenDate from "@/src/components/ProfileMessagesScreenDate";
import ProfileMessagesScreenMetadata from "@/src/components/ProfileMessagesScreenMetadata";
import { DisplayableMessage } from "@/src/types/";
import { IM_CHAT_TEXT } from "@smashchats/library";
import ProfileMessagesScreenUnreadMessages from "@/src/components/ProfileMessagesScreenUnreadMessages";

type MessagesListProps = {
    messages: DisplayableMessage[];
    paddingTop?: number;
};
export const RenderMessageListItem = ({
    message,
    idx,
}: {
    message: DisplayableMessage;
    idx: number;
}) => {
    switch (message.type) {
        case IM_CHAT_TEXT:
            return (
                <ProfileMessagesScreenText
                    key={`${message.type}-${message.sha256}`}
                    message={message}
                />
            );
        case "system-date":
            return (
                <ProfileMessagesScreenDate
                    key={`${message.type}-${message.sha256}-index-${idx}`}
                    date={message.date}
                />
            );
        case "system-unread":
            return (
                <ProfileMessagesScreenUnreadMessages
                    key={`${message.type}-${message.sha256}-index-${idx}`}
                    message={`${message.content} unread message${
                        (message.content as number) === 1 ? "" : "s"
                    }`}
                />
            );
        case "metadata":
            return (
                <ProfileMessagesScreenMetadata
                    key={`${message.type}-${message.sha256}`}
                    message={message}
                />
            );
        case "profile":
            return <View key={`${message.type}-${message.sha256}`} />;
        case "profiles":
            return (
                <ProfileMessagesScreenText
                    key={`${message.type}-${message.sha256}`}
                    message={{
                        ...message,
                        content: "Several profiles [...]",
                    }}
                />
            );
        default:
            return <Box key={`${message.type}-index-${idx}`} />;
    }
};
