import { TouchableHighlight } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { DisplayableMessage } from "@/src/types/index";
import { ProfileMessagesScreenBubble } from "./ProfileMessagesScreenBubble";

export const ProfileMessagesScreenMedia = ({
    message,
}: {
    message: DisplayableMessage;
}) => {
    const router = useRouter();

    return (
        <ProfileMessagesScreenBubble message={message} padding={10}>
            <TouchableHighlight
                style={{ borderRadius: 4 }}
                onPress={() => {
                    router.navigate(
                        `/gallery?activePhotoUri=${message.content}`
                    );
                }}
            >
                <Image
                    source={{ uri: message.content }}
                    style={{ width: 200, height: 200, borderRadius: 4 }}
                />
            </TouchableHighlight>
        </ProfileMessagesScreenBubble>
    );
};
