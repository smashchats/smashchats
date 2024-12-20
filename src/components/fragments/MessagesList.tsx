import React from "react";
import { View } from "react-native";

import { Box } from "@/src/components/design-system/Box";
import { Colors } from "@/src/constants/Colors";
import ProfileMessagesScreenText from "@/src/components/ProfileMessagesScreenText";
import ProfileMessagesScreenDate from "@/src/components/ProfileMessagesScreenDate";
import ProfileMessagesScreenMetadata from "@/src/components/ProfileMessagesScreenMetadata";
import { Message } from "@/src/app/profile/[user]/(tabs)/messages";
import { IM_CHAT_TEXT } from "@smashchats/library";

type MessagesListProps = {
    messages: Message[];
    paddingTop?: number;
};

export const MessagesList = ({
    messages,
    paddingTop = 0,
}: MessagesListProps) => {
    return (
        <Box marginHorizontal={10} paddingTop={paddingTop}>
            <Box width={"100%"} bg={Colors.background} paddingBottom={40}>
                {messages.map((m, idx) => {
                    let id = m.sha256 ?? `index-${idx}`;

                    switch (m.type) {
                        case IM_CHAT_TEXT:
                            return (
                                <ProfileMessagesScreenText
                                    key={`${m.type}-${id}`}
                                    message={m}
                                />
                            );
                        case "system-date":
                            return (
                                <ProfileMessagesScreenDate
                                    key={`${m.type}-${id}-index-${idx}`}
                                    date={m.date}
                                />
                            );
                        case "metadata":
                            return (
                                <ProfileMessagesScreenMetadata
                                    key={`${m.type}-${id}`}
                                    message={m}
                                />
                            );
                        case "profile":
                            return <View key={`${m.type}-${id}`} />;
                        case "profiles":
                            return (
                                <ProfileMessagesScreenText
                                    key={`${m.type}-${id}`}
                                    message={{
                                        ...m,
                                        content: "Several profiles [...]",
                                    }}
                                />
                            );
                        default:
                            return <Box key={`${m.type}-index-${idx}`} />;
                    }
                })}
            </Box>
        </Box>
    );
};

export default MessagesList;
