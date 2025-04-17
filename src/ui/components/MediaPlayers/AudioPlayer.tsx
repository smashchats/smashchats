import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

import {
    useAudioPlayer,
    useAudioPlayerStatus,
    setAudioModeAsync,
} from "expo-audio";
import type { AudioStatus } from "expo-audio";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

import { Box, HStack } from "@/src/ui/design-system/layout";
import { useGlobalDispatch, useGlobalState } from "@/src/context/GlobalContext";

interface AudioPlayerProps {
    sha256: string;
    mimeType: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    sha256,
    mimeType,
}) => {
    const dispatch = useGlobalDispatch();
    const {
        mediaPlayer: { currentMedia },
    } = useGlobalState();
    const uri = `${FileSystem.documentDirectory}media/${sha256}.${
        mimeType.split("/")[1]
    }`;
    const isCurrentlyPlaying =
        currentMedia?.id === sha256 && currentMedia?.isPlaying;

    const [playerStatus, setPlayerStatus] = useState<AudioStatus | null>(null);
    const player = useAudioPlayer({ uri });
    const status = useAudioPlayerStatus(player);

    useEffect(() => {
        if (status) {
            setPlayerStatus(status);
        }
    }, [status]);

    useEffect(() => {
        (async () => {})();
    }, []);

    useEffect(() => {
        if (currentMedia?.id === sha256) {
            player.play();
        } else {
            player.pause();
        }
    }, [currentMedia?.id, sha256, player]);

    useEffect(() => {
        if (playerStatus?.didJustFinish) {
            dispatch({ type: "STOP_MEDIA_ACTION" });
            player.seekTo(0);
        }
    }, [playerStatus?.didJustFinish, dispatch, player]);

    const playPause = async () => {
        if (!playerStatus?.isLoaded) return;

        if (playerStatus.playing) {
            dispatch({ type: "PAUSE_MEDIA_ACTION" });
            player.pause();
        } else {
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                interruptionMode: "doNotMix",
            });
            dispatch({
                type: "PLAY_MEDIA_ACTION",
                payload: { id: sha256, uri },
            });
            player.play();
        }
    };

    const currentTime = playerStatus?.currentTime ?? 0;
    const duration = playerStatus?.duration ?? 1;

    return (
        <HStack alignItems="center">
            <TouchableOpacity onPress={playPause}>
                <MaterialCommunityIcons
                    name={
                        isCurrentlyPlaying
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
