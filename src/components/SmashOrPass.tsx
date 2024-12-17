import React from "react";

import { Pressable } from "react-native";
import { Image } from "expo-image";

import { Colors } from "@/src/constants/Colors.js";
import { NeonText } from "@/src/components/NeonText.jsx";
import { Badge } from "@/src/components/design-system/Badge.jsx";
import { Box } from "@/src/components/design-system/Box.jsx";

const Lightning = require("@/assets/lightning-bolt.png");

type Props = {
    onSmash: () => void;
    onPass: () => void;
};

export function SmashOrPass({ onSmash, onPass }: Readonly<Props>): JSX.Element {
    return (
        <Badge
            borderRadius={16}
            bgColor={Colors.background}
            borderColor={Colors.purple}
            borderWidth={3.5}
        >
            <Pressable testID="SmashOrPass::Smash" onPress={onSmash}>
                <NeonText text="Smash" />
            </Pressable>
            <Box width={25} />
            <Image
                style={{
                    overflow: "visible",
                    position: "absolute",
                    height: 50,
                    width: 25,
                    left: 57,
                    transform: [{ scale: 0.8 }],
                }}
                alt="Lightning bolt"
                source={Lightning}
            />
            <Pressable testID="SmashOrPass::Pass" onPress={onPass}>
                <NeonText text="pass" />
            </Pressable>
        </Badge>
    );
}
