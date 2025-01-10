import React from "react";

import { Colors } from "@/src/constants/Colors.js";
import { Text } from "@/src/ui/design-system/Text";
import { Box } from "@/src/ui/design-system/layout";

type Props = {
    message: string;
};

export function ProfileMessagesScreenUnreadMessages({
    message,
}: Readonly<Props>): JSX.Element {
    return (
        <Box
            backgroundColor={Colors.darkerGray}
            alignItems={"center"}
            width={"100%"}
            alignSelf={"center"}
            paddingVertical={10}
            paddingHorizontal={14}
            marginBottom={10}
            borderTopWidth={1}
            borderTopColor={Colors.darkGray}
        >
            <Text color="white" fontWeight="bold">
                {message}
            </Text>
        </Box>
    );
}

export default ProfileMessagesScreenUnreadMessages;
