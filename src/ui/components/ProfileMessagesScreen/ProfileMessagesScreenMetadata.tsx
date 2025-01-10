import React from "react";

import { Colors } from "@/src/constants/Colors.js";
import { DisplayableMessage } from "@/src/types/";
import { Box } from "@/src/ui/design-system/layout";
import { Text } from "@/src/ui/design-system/Text";

type Props = {
    message: DisplayableMessage;
};

export function ProfileMessagesScreenMetadata({
    message,
}: Readonly<Props>): JSX.Element {
    const fromMe = message.from === "0";
    const alignSelf = fromMe ? "flex-end" : "flex-start";

    return (
        <Box
            alignItems={"flex-start"}
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
