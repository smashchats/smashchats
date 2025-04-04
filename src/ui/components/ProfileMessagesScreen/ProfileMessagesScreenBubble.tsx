import React, { useEffect, useState } from "react";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MessageStatus } from "@smashchats/library";

import { Colors } from "@/src/constants/Colors.js";
import { Box, HStack } from "@/src/ui/design-system/layout";
import { Text } from "@/src/ui/design-system/Text";
import { DisplayableChatMessage, DisplayableMessage } from "@/src/types/";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { eq } from "drizzle-orm";
import { drizzle_db } from "@/src/db/database";
import { messages } from "@/src/db/schema";

type MessageStatusProps = {
    status: MessageStatus;
};

export function MessageStatusIcon({ status }: Readonly<MessageStatusProps>) {
    const color = (() => {
        switch (status) {
            // @ts-expect-error
            case "sending":
            case "delivered": // to SME
            case "received": // by peer
                return Colors.textLightGray;
            case "read": // by peer
                return Colors.blue;
            // @ts-expect-error
            case "failed":
                return Colors.red;
            default:
                return Colors.yellow;
        }
    })();
    const name = (() => {
        switch (status) {
            // @ts-expect-error
            case "sending":
                return "clock-outline";
            case "delivered": // to SME
                return "check";
            case "received": // by peer
                return "check";
            case "read": // by peer
                return "check-all";
            // @ts-expect-error
            case "failed":
                return "alert-circle-outline";
            default:
                return "crosshairs-question";
        }
    })();

    return (
        <MaterialCommunityIcons
            style={{ marginLeft: 5, paddingTop: 2 }}
            name={name}
            size={14}
            color={color}
        />
    );
}

type Props = {
    children: React.ReactNode;
    message: DisplayableMessage;
    padding?: number;
};

export function ProfileMessagesScreenBubble({
    children,
    message,
    padding,
}: Readonly<Props>): JSX.Element {
    const backgroundColor = message.fromMe ? Colors.purple : Colors.darkGray;
    const alignSelf = message.fromMe ? "flex-end" : "flex-start";

    const [status, setStatus] = useState<MessageStatus>(
        (message.fromMe &&
            message.hasOwnProperty("status") &&
            (message as DisplayableChatMessage).status) ||
            ("sending" as MessageStatus)
    );

    const { data: messageData } = useLiveQuery(
        drizzle_db
            .select({ message: messages })
            .from(messages)
            .where(eq(messages.sha256, message.sha256))
    );

    useEffect(() => {
        if (messageData && messageData.length > 0) {
            setStatus(messageData[0].message.status as MessageStatus);
        }
    }, [messageData]);

    return (
        <Box
            backgroundColor={backgroundColor}
            alignItems={"flex-start"}
            borderRadius={10}
            maxWidth={"80%"}
            alignSelf={alignSelf}
            paddingVertical={padding ?? 10}
            paddingHorizontal={padding ?? 14}
            marginBottom={10}
            marginHorizontal={10}
        >
            {children}

            <Box width={"100%"} minHeight={16.5} justifyContent="flex-end">
                <HStack alignItems="center" justifyContent="flex-end">
                    <Text fontSize={12} color={Colors.textLightGray}>
                        {message.date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        })}
                    </Text>
                    {message.fromMe && message.hasOwnProperty("status") && (
                        <MessageStatusIcon status={status} />
                    )}
                </HStack>
            </Box>
        </Box>
    );
}

export default ProfileMessagesScreenBubble;
