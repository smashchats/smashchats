import React from "react";
import { View, StyleSheet } from "react-native";

import { Image } from "expo-image";

import { TrustedContact } from "@/src/types/Contacts.types";
import { Text } from "@/src/ui/design-system/Text";
import { Colors } from "@/src/constants/Colors";
import { SCREEN_WIDTH } from "@/src/ui/constants";
import { Box, HStack, VStack } from "@/src/ui/design-system/layout";

export const ProfileHeaderExpanded = ({ peer }: { peer?: TrustedContact }) => {
    return (
        <View
            style={{
                backgroundColor: Colors.purple,
                minHeight: SCREEN_WIDTH,
            }}
        >
            <Image
                style={styles.backgroundImage}
                alt="Profile picture"
                cachePolicy="memory-disk"
                source={peer?.meta_avatar}
            />
            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                width={SCREEN_WIDTH}
                backgroundColor={"#00000088"}
                paddingHorizontal={20}
                paddingVertical={10}
            >
                <HStack alignItems="center">
                    <VStack flex={1}>
                        <Text color="white" marginBottom={10}>
                            {peer?.meta_title}
                        </Text>
                        <Text>{peer?.meta_description}</Text>
                    </VStack>
                </HStack>
            </Box>
        </View>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        width: "100%",
        minWidth: SCREEN_WIDTH,
        minHeight: SCREEN_WIDTH,
        height: 300,
    },
});
