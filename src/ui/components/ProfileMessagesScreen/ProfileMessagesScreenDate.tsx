import React from "react";

import { Colors } from "@/src/constants/Colors.js";
import { Text } from "@/src/ui/design-system/Text";
import { Box } from "@/src/ui/design-system/layout";

type Props = {
    date: Date;
};

export function ProfileMessagesScreenDate({
    date,
}: Readonly<Props>): JSX.Element {
    const options = {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    } as const;

    const formatter = new Intl.DateTimeFormat("en-US", options);

    return (
        <Box
            backgroundColor={Colors.background}
            alignItems={"center"}
            width={"80%"}
            alignSelf={"center"}
            paddingVertical={10}
            paddingHorizontal={14}
            marginBottom={10}
        >
            <Text color="white">{formatter.format(date)}</Text>
        </Box>
    );
}

export default ProfileMessagesScreenDate;
