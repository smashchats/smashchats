import React from "react";

import { TrustedContact } from "@/src/db/models/Contacts";
import { Text } from "@/src/ui/design-system/Text";

import { Image } from "expo-image";

import { View } from "react-native";
import { Colors } from "@/src/constants/Colors";

export const ProfileHeaderExpanded = ({ peer }: { peer?: TrustedContact }) => {
    return (
        <View style={{ backgroundColor: Colors.purple, paddingHorizontal: 10 }}>
            <Image
                style={{
                    width: "100%",
                    height: 300,
                }}
                alt="Profile picture"
                source={peer?.meta_avatar}
            />
            <Text color="white" marginBottom={10}>
                {peer?.meta_title}
            </Text>
            <Text>{peer?.meta_description}</Text>
        </View>
    );
};
