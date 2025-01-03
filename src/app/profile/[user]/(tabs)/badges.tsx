import React, { forwardRef, memo } from "react";
import { StyleSheet, ScrollViewProps } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box.jsx";
import { Text } from "@/src/components/design-system/Text.jsx";
import Animated from "react-native-reanimated";

export const ProfileBadges = forwardRef<Animated.ScrollView, ScrollViewProps>(
    (props, ref) => {
        const { user: profileId } = useLocalSearchParams();

        return (
            <Animated.ScrollView ref={ref} style={styles.container} {...props}>
                <Box marginHorizontal={10}>
                    <Box width={"100%"} backgroundColor={"green"} height={2000}>
                        <Text color="white">BADGES {profileId}</Text>
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

export default memo(ProfileBadges);
