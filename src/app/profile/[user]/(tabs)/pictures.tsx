import React, { forwardRef, memo, useEffect, useState } from "react";
import { ScrollViewProps, TouchableOpacity, StyleSheet } from "react-native";

import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/ui/design-system/layout";
import Animated from "react-native-reanimated";
import { SCREEN_HEIGHT } from "@/src/ui/constants";
import { getAllMediaInDiscussion } from "@/src/db/models/Media";
import { Text } from "@/src/ui/design-system/Text";

export const ProfilePictures = forwardRef<Animated.ScrollView, ScrollViewProps>(
    function ProfilePictures(props, ref) {
        const { user: discussionId } = useLocalSearchParams();
        const [images, setImages] = useState<string[]>([]);

        useEffect(() => {
            const fetchData = async () => {
                setImages(
                    (await getAllMediaInDiscussion(discussionId as string)).map(
                        (d) => d.file_path
                    )
                );
            };
            fetchData();
        }, [discussionId]);

        return (
            <Animated.ScrollView ref={ref} style={styles.container} {...props}>
                <Box marginHorizontal={10} minHeight={SCREEN_HEIGHT + 200}>
                    <Box
                        width={"100%"}
                        backgroundColor={Colors.background}
                        paddingBottom={40}
                    >
                        <Box
                            width={"100%"}
                            flexWrap="wrap"
                            display="flex"
                            flexDirection="row"
                        >
                            {images.map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={{
                                        width: "33.3333%",
                                        height: 120,
                                        aspectRatio: 1,
                                    }}
                                    onPress={() => {
                                        router.push(
                                            `/gallery?activePhotoUri=${p}`
                                        );
                                    }}
                                >
                                    <Image
                                        contentFit="cover"
                                        cachePolicy="memory-disk"
                                        style={{
                                            height: "100%",
                                            borderRadius: 2,
                                            aspectRatio: 1,
                                            transform: [
                                                { scaleY: 0.96 },
                                                { scaleX: 0.96 },
                                            ],
                                        }}
                                        source={{ uri: p }}
                                    />
                                </TouchableOpacity>
                            ))}
                            {images.length === 0 && (
                                <Box
                                    width={"100%"}
                                    height={"100%"}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text>
                                        No images in this discussion (yet)
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Animated.ScrollView>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
    },
});

export default memo(ProfilePictures);
