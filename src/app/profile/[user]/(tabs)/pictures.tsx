import React, { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

import { Image } from "expo-image";
import * as ScreenOrientation from "expo-screen-orientation";
import ImageView from "react-native-image-viewing";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box.jsx";

export const ProfilePictures = () => {
    // how to find profileId --> const { user: profileId } = useLocalSearchParams();
    // how to find profile --> const profile = data.find((d) => d.id === profileId);

    const pics = [0, 1, 2, 3, 4];

    function handleImagePress(p: number): void {
        ScreenOrientation.unlockAsync().then(() => setImageViewIndex(p));
    }

    const images =
        //pics.map(p => ({ uri: profile?.imageBase64, id: p }))
        [
            {
                uri: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4",
            },
            {
                uri: "https://images.unsplash.com/photo-1573273787173-0eb81a833b34",
            },
            {
                uri: "https://images.unsplash.com/photo-1569569970363-df7b6160d111",
            },
        ];

    const [imageViewIndex, setImageViewIndex] = useState(-1);

    return (
        <Box flex={1} bg={Colors.background} h="100%">
            {/* Doesn't support Landscape Orientation, see: https://github.com/jobtoday/react-native-image-viewing/blob/master/src/ImageViewing.tsx#L102*/}
            {/* Might want to change to `react-native-image-zoom-viewer`: https://github.com/jobtoday/react-native-image-viewing/issues/141#issuecomment-1605478538 */}
            {/* Or re-implement myself */}

            {/* @ts-ignore */}
            <ImageView
                images={images}
                imageIndex={imageViewIndex}
                visible={imageViewIndex >= 0}
                keyExtractor={(_p: any, idx: number) => `image-${idx}`}
                onRequestClose={() => {
                    ScreenOrientation.lockAsync(
                        ScreenOrientation.OrientationLock.PORTRAIT_UP
                    );
                    setImageViewIndex(-1);
                }}
            />

            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                stickyHeaderIndices={[1]}
                contentContainerStyle={{ justifyContent: "flex-start" }}
            >
                <Box marginHorizontal={10}>
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
                            {pics.map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={{
                                        width: "33.3333%",
                                        height: 120,
                                        aspectRatio: 1,
                                    }}
                                    onPress={() => handleImagePress(p)}
                                >
                                    <Image
                                        contentFit="cover"
                                        style={{
                                            height: "100%",
                                            borderRadius: 2,
                                            aspectRatio: 1,
                                            transform: [
                                                { scaleY: 0.96 },
                                                { scaleX: 0.96 },
                                            ],
                                        }}
                                        source={
                                            "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4"
                                        }
                                    />
                                </TouchableOpacity>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </ScrollView>
        </Box>
    );
};

export default ProfilePictures;
