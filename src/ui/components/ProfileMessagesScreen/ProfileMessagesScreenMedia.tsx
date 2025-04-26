import { TouchableHighlight } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { DisplayableMediaMessage } from "@/src/types/index";
import { ProfileMessagesScreenBubble } from "./ProfileMessagesScreenBubble";
import { AudioPlayer } from "@/src/ui/components/MediaPlayers/AudioPlayer";
import { MEDIA_DIR, THUMBNAILS_DIR } from "@/src/utils/MediaStorage";

export const ProfileMessagesScreenMedia = ({
    message,
}: {
    message: DisplayableMediaMessage;
}) => {
    const router = useRouter();
    const mediaType = message.media?.media_type;

    const mediaUri = MEDIA_DIR + (message.media?.file_path ?? message.content);
    const thumbnailUri = THUMBNAILS_DIR + (message.media?.thumbnail_path ?? mediaUri);

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
                                        `/gallery?activePhotoUri=${mediaUri}&mediaType=${mediaType}`
                                    );
                                }}
                            >
                                <Image
                                    source={{ uri: thumbnailUri }}
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
