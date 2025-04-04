import { Image } from "expo-image";

import { DisplayableMessage } from "@/src/types/index";
import { ProfileMessagesScreenBubble } from "./ProfileMessagesScreenBubble";
import { TouchableHighlight } from "react-native";

export const ProfileMessagesScreenMedia = ({
    message,
}: {
    message: DisplayableMessage & { data: string };
}) => {
    return (
        <ProfileMessagesScreenBubble message={message} padding={10}>
            <TouchableHighlight
                style={{ borderRadius: 4 }}
                onPress={() => {
                    // TODO: Add image viewer/modal
                }}
            >
                <Image
                    source={{ uri: message.data }}
                    style={{ width: 200, height: 200, borderRadius: 4 }}
                />
            </TouchableHighlight>
        </ProfileMessagesScreenBubble>
    );
};
