import React from "react";
import { Button, StyleSheet, View } from "react-native";

import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";

const VideoPlayer = ({ uri }: { uri: string }) => {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true;
        player.play();
    });

    const { isPlaying } = useEvent(player, "playingChange", {
        isPlaying: player.playing,
    });

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <VideoView
                style={StyleSheet.absoluteFillObject}
                contentFit="contain"
                nativeControls={false}
                player={player}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
            />
            <View style={styles.buttons}>
                <Button
                    title={isPlaying ? "Pause" : "Play"}
                    onPress={() => {
                        if (isPlaying) {
                            player.pause();
                        } else {
                            player.play();
                        }
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    buttons: {
        position: "absolute",
        bottom: 0,
        left: 0,
        backgroundColor: "white",
        minHeight: 100,
        minWidth: 100,
    },
});

export default VideoPlayer;
