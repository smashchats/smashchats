import React, { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

import { Image } from "expo-image";
import * as ScreenOrientation from "expo-screen-orientation";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box.jsx";

export const ProfilePictures = () => {
    // how to find profileId --> const { user: profileId } = useLocalSearchParams();
    // how to find profile --> const profile = data.find((d) => d.id === profileId);

    return (
        <Box flex={1} bg={Colors.background} h="100%">
            {/* Doesn't support Landscape Orientation, see: https://github.com/jobtoday/react-native-image-viewing/blob/master/src/ImageViewing.tsx#L102*/}
            {/* Might want to change to `react-native-image-zoom-viewer`: https://github.com/jobtoday/react-native-image-viewing/issues/141#issuecomment-1605478538 */}
            {/* Or re-implement myself */}

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
                            {[].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={{
                                        width: "33.3333%",
                                        height: 120,
                                        aspectRatio: 1,
                                    }}
                                    onPress={() => {}}
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
