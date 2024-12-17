import React from "react";

import { Colors } from "@/src/constants/Colors.js";
import { Message } from "@/src/app/profile/[user]/(tabs)/messages.jsx";
import { Box } from "@/src/components/design-system/Box.jsx";
import { Text } from "@/src/components/design-system/Text.jsx";

type Props = {
    message: Message;
};

export function ProfileMessagesScreenMetadata({
    message,
}: Readonly<Props>): JSX.Element {
    const fromMe = message.from === "0";
    const alignSelf = fromMe ? "flex-end" : "flex-start";

    return (
        <Box
            alignItems={"flex-start"}
            borderRadius={24}
            maxWidth={"80%"}
            alignSelf={alignSelf}
            paddingVertical={10}
            paddingHorizontal={14}
            marginBottom={10}
        >
            <Text color={Colors.textGray}>{message.content}</Text>
        </Box>
    );
}

export default ProfileMessagesScreenMetadata;
