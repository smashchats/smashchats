import React from "react";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box.js";
import Text from "@/src/components/design-system/Text.js";
import { Message } from "@/src/app/profile/[user]/(tabs)/messages.js";

type Props = {
    message: Message;
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
            borderRadius={24}
            maxWidth={"80%"}
            alignSelf={alignSelf}
            paddingVertical={10}
            paddingHorizontal={14}
            marginBottom={10}
        >
            <Text color="white">{message.content}</Text>
        </Box>
    );
}

export default ProfileMessagesScreenText;
