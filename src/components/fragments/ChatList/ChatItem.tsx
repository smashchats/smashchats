import React, { type PropsWithChildren } from "react";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Colors } from "@/src/constants/Colors.js";
import { HStack } from "@/src/components/design-system/HStack.jsx";
import { Box } from "@/src/components/design-system/Box.jsx";
import { Avatar } from "@/src/components/Avatar.jsx";
import { VStack } from "@/src/components/design-system/VStack.jsx";
import { SerifHeading } from "@/src/components/design-system/SerifHeading.jsx";
import { Heading } from "@/src/components/design-system/Heading.jsx";
import { Badge } from "@/src/components/design-system/Badge.jsx";
import { BadgeText } from "@/src/components/design-system/BadgeText.jsx";
import { daysBetweenTwoDates } from "@/src/Utils.js";
import { ChatListView } from "@/src/db/schema.js";
import { TrustedContact } from "@/src/models/Contacts";

type ChatItemProps = PropsWithChildren<ChatListView>;

export function dateToShowableString(date: Date): string {
    const now = new Date();
    const diffInDays = daysBetweenTwoDates(date, now);

    if (diffInDays === 0) {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }
    if (diffInDays === 1) {
        return "Yesterday";
    }
    if (diffInDays < 7) {
        const weekdays = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        return weekdays[date.getDay()];
    }
    return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}

function getExcerpt(rawMessage: string, messageType: string): string {
    if (messageType === "text") {
        return rawMessage.split(" ").slice(0, 10).join(" ");
    } else if (messageType === "empty") {
        return "(new contact)";
    }
    // TODO: add support for other message types

    return "unsupported message";
}

function ChatItem({
    did_id,
    meta_title,
    unread_count,
    trusted_name,
    most_recent_message,
    most_recent_message_type,
    most_recent_message_date,
    smashed,
    meta_picture,
}: ChatItemProps): React.JSX.Element {
    const date = dateToShowableString(new Date(most_recent_message_date));

    return (
        <Box flex={1} marginBottom={4} paddingHorizontal={10}>
            <HStack
                gap={12}
                alignItems="center"
                marginBottom={12}
                alignContent="flex-start"
            >
                <Avatar
                    contact={
                        {
                            did_id,
                            meta_title,
                            meta_picture,
                            trusted_name,
                        } as TrustedContact
                    }
                    variant={"large"}
                />
                <VStack flex={1} gap={4} marginBottom={12}>
                    <SerifHeading color="white">
                        {trusted_name ?? meta_title ?? "unnamed contact"}
                        {trusted_name !== undefined && " "}
                        {trusted_name !== undefined && (
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={14}
                                color="white"
                            />
                        )}
                    </SerifHeading>
                    <Heading
                        fontWeight={"400"}
                        color="white"
                        fontSize={12}
                        isTruncated={true}
                    >
                        {getExcerpt(
                            most_recent_message,
                            most_recent_message_type
                        ) ?? "new contact"}
                    </Heading>
                </VStack>
                <VStack alignItems="flex-end" gap={12}>
                    <Heading
                        color={Colors.textWhite}
                        fontFamily='Cairo, apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                        fontWeight="100"
                        fontSize={12}
                        marginBottom={-2}
                    >
                        {date}
                    </Heading>

                    {unread_count > 0 && (
                        <Badge type={smashed ? "smashed" : "trusted"}>
                            <BadgeText
                                fontWeight="100"
                                color={Colors.textWhite}
                            >
                                {unread_count}
                            </BadgeText>
                        </Badge>
                    )}
                    {unread_count === 0 && <Box height={20} />}
                </VStack>
            </HStack>
        </Box>
    );
}

export default ChatItem;
