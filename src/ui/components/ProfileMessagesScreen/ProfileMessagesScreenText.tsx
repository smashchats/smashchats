import React from "react";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { MessageStatus } from "@smashchats/library";

import { Colors } from "@/src/constants/Colors.js";
import { Text } from "@/src/ui/design-system/Text";
import { DisplayableMessage } from "@/src/types/index";
import { ProfileMessagesScreenBubble } from "./ProfileMessagesScreenBubble";

type MessageStatusProps = {
    status: MessageStatus;
};

export function MessageStatusIcon({ status }: Readonly<MessageStatusProps>) {
    const color = (() => {
        switch (status) {
            case "sending":
            case "delivered": // to SME
            case "received": // by peer
                return Colors.textLightGray;
            case "read": // by peer
                return Colors.blue;
            case "error":
                return Colors.red;
            default:
                return Colors.yellow;
        }
    })();
    const name = (() => {
        switch (status) {
            case "sending":
                return "clock-outline";
            case "delivered": // to SME
                return "check";
            case "received": // by peer
                return "check";
            case "read": // by peer
                return "check-all";
            case "error":
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
    message: DisplayableMessage;
};

export function ProfileMessagesScreenText({
    message,
}: Readonly<Props>): JSX.Element {
    return (
        <ProfileMessagesScreenBubble message={message}>
            <Text color="white">{message.content}</Text>
        </ProfileMessagesScreenBubble>
    );
}

export default ProfileMessagesScreenText;
