import { TouchableHighlight } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { DisplayableMediaMessage } from "@/src/types/index";
import { ProfileMessagesScreenBubble } from "./ProfileMessagesScreenBubble";
import { AudioPlayer } from "@/src/ui/components/AudioPlayer/AudioPlayer";

export const ProfileMessagesScreenMedia = ({
    message,
}: {
    message: DisplayableMediaMessage;
}) => {
    const router = useRouter();
    const mediaType = message.media?.media_type;

    return (
        <ProfileMessagesScreenBubble message={message} padding={10}>
            {(() => {
                switch (mediaType) {
                    case "image":
                    case "video":
                        return (
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
                                    cachePolicy="memory-disk"
                                    style={{
                                        width: 200,
                                        height: 200,
                                        borderRadius: 4,
                                    }}
                                />
                            </TouchableHighlight>
                        );
                    case "audio":
                        return (
                            <AudioPlayer
                                sha256={message.media.sha256}
                                mimeType={message.media.mime_type}
                            />
                        );
                    default:
                }
            })()}
        </ProfileMessagesScreenBubble>
    );
};
