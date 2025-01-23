import React from "react";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Colors } from "@/src/constants/Colors.js";
import { Box, HStack } from "@/src/ui/design-system/layout";
import { Text } from "@/src/ui/design-system/Text";
import { DisplayableChatMessage, DisplayableMessage } from "@/src/types/";

type MessageStatusProps = {
    status: "read" | "delivered" | "pending" | undefined;
};

export function MessageStatus({ status }: Readonly<MessageStatusProps>) {
    const color = (() => {
        switch (status) {
            case "pending":
            case "delivered":
                return Colors.textLightGray;
            case "read":
                return Colors.blue;
            default:
                return Colors.yellow;
        }
    })();
    const name = (() => {
        switch (status) {
            case "pending":
                return "clock-outline";
            case "delivered":
                return "check";
            case "read":
                return "check-all";
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
    message: DisplayableMessage;
};

export function ProfileMessagesScreenText({
    message,
}: Readonly<Props>): JSX.Element {
    const backgroundColor = message.fromMe ? Colors.purple : Colors.darkGray;
    const alignSelf = message.fromMe ? "flex-end" : "flex-start";

    return (
        <Box
            backgroundColor={backgroundColor}
            alignItems={"flex-start"}
            borderRadius={10}
            maxWidth={"80%"}
            alignSelf={alignSelf}
            paddingVertical={10}
            paddingHorizontal={14}
            marginBottom={10}
            marginHorizontal={10}
        >
            <Text color="white">{message.content}</Text>

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
                        <MessageStatus
                            status={(message as DisplayableChatMessage).status}
                        />
                    )}
                </HStack>
            </Box>
        </Box>
    );
}

export default ProfileMessagesScreenText;
