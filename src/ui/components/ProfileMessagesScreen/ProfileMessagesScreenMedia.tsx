import { useEffect } from "react";
import { TouchableHighlight, TouchableOpacity } from "react-native";

import { Image } from "expo-image";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Audio, InterruptionModeIOS } from "expo-av";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { DisplayableMediaMessage } from "@/src/types/index";
import { ProfileMessagesScreenBubble } from "./ProfileMessagesScreenBubble";
import { Box, HStack } from "@/src/ui/design-system/layout";

const AudioPlayer = ({ sha256 }: { sha256: string }) => {
    useEffect(() => {
        (async () => {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                allowsRecordingIOS: false,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            });
        })();
    }, []);

    const player = useAudioPlayer({
        uri: `${FileSystem.documentDirectory}media/${sha256}.webm`,
    });
    const { currentTime, duration, timeControlStatus, playing } =
        useAudioPlayerStatus(player);

    return (
        <HStack alignItems="center">
            <TouchableOpacity
                onPress={() => (playing ? player.pause() : player.play())}
            >
                <MaterialCommunityIcons
                    name={
                        timeControlStatus === "playing"
                            ? "pause-circle-outline"
                            : "play-circle-outline"
                    }
                    size={24}
                    color="white"
                />
            </TouchableOpacity>
            <Box marginLeft={8} h={3} flex={1} bg="gray">
                <Box
                    h={1}
                    width={`${(currentTime / duration) * 100}%`}
                    flex={1}
                    bg="white"
                />
            </Box>
        </HStack>
    );
};

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
                        return <AudioPlayer sha256={message.media.sha256} />;
                    default:
                }
            })()}
        </ProfileMessagesScreenBubble>
    );
};
