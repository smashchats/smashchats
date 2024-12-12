import React, { useEffect, useState } from "react";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box.js";
import Text from "@/src/components/design-system/Text.js";
import { Message } from "@/src/app/profile/[user]/(tabs)/messages.js";
import { useGlobalState } from "@/src/context/GlobalContext.js";

type Props = {
    message: Message;
};

export function ProfileMessagesScreenText({
    message,
}: Readonly<Props>): JSX.Element {
    const globalState = useGlobalState();
    const [fromMe, setFromMe] = useState(false);
    useEffect(() => {
        const getMyDID = async () => {
            const selfDid = await globalState.selfSmashUser.getDID();
            setFromMe(message.from === selfDid?.id);
        };
        getMyDID();
    }, [message.from, globalState.selfSmashUser]);
    const backgroundColor = fromMe ? Colors.purple : Colors.darkGray;
    const alignSelf = fromMe ? "flex-end" : "flex-start";

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
