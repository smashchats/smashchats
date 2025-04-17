import React from "react";

import { Text } from "@/src/ui/design-system/Text";
import { DisplayableMessage } from "@/src/types/index";
import { ProfileMessagesScreenBubble } from "./ProfileMessagesScreenBubble";

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
