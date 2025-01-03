import React, { forwardRef, memo } from "react";
import { ScrollViewProps, TouchableOpacity, StyleSheet } from "react-native";

import { Image } from "expo-image";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box.jsx";
import Animated from "react-native-reanimated";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";

export const ProfilePictures = forwardRef<Animated.ScrollView, ScrollViewProps>(
    (props, ref) => {
        // how to find profileId --> const { user: profileId } = useLocalSearchParams();
        // how to find profile --> const profile = data.find((d) => d.id === profileId);

        // Doesn't support Landscape Orientation, see: https://github.com/jobtoday/react-native-image-viewing/blob/master/src/ImageViewing.tsx#L102
        // Might want to change to `react-native-image-zoom-viewer`: https://github.com/jobtoday/react-native-image-viewing/issues/141#issuecomment-1605478538
        // Or re-implement myself

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
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
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
