import { Image } from "expo-image";

import { DisplayableMessage } from "@/src/types/index";
import { ProfileMessagesScreenBubble } from "./ProfileMessagesScreenBubble";

export const ProfileMessagesScreenMedia = ({
    message,
}: {
    message: DisplayableMessage & { data: string };
}) => {
    return (
        <ProfileMessagesScreenBubble message={message}>
            <Image
                source={{ uri: message.data }}
                style={{ width: 100, height: 100 }}
            />
        </ProfileMessagesScreenBubble>
    );
};
