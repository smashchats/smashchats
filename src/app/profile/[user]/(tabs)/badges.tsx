import React from "react";
import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box.jsx";
import Text from "@/src/components/design-system/Text.jsx";

export const ProfileBadges = () => {
    const { user: profileId } = useLocalSearchParams();

    return (
        <Box flex={1} bg={Colors.background} h="100%">
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                stickyHeaderIndices={[1]}
                contentContainerStyle={{ justifyContent: "flex-start" }}
            >
                <Box marginHorizontal={10}>
                    <Box width={"100%"} backgroundColor={"green"} height={2000}>
                        <Text color="white">BADGES {profileId}</Text>
                    </Box>
                </Box>
            </ScrollView>
        </Box>
    );
};

export default ProfileBadges;
