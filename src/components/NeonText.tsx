import React from "react";
import { View } from "react-native";
import { Colors } from "@/src/constants/Colors.js";
import { Text } from "@/src/components/design-system/Text.jsx";

// Text stroke using this technique: https://stackoverflow.com/a/60469925

type Props = {
    text: string;
    color?: string;
    shadowColor?: string;
    marginHorizontal?: number;
};

export function NeonText({
    text,
    color = "white",
    shadowColor = Colors.purple,
    marginHorizontal = 0,
}: Readonly<Props>): JSX.Element {
    return (
        <View>
            {/* <Text>{text}</Text> */}
            <Text
                fontSize={14}
                marginHorizontal={marginHorizontal}
                color={color}
                textShadowColor={shadowColor}
                textShadowRadius={1}
                textShadowOffset={{ width: 1.1, height: 1.1 }}
                textTransform="uppercase"
            >
                {text}
            </Text>
            <Text
                position="absolute"
                fontSize={14}
                marginLeft={marginHorizontal}
                color={color}
                textShadowColor={shadowColor}
                textShadowRadius={1}
                textShadowOffset={{ width: -1.1, height: -1.1 }}
                textTransform="uppercase"
            >
                {text}
            </Text>
            <Text
                position="absolute"
                fontSize={14}
                marginLeft={marginHorizontal}
                color={color}
                textShadowColor={shadowColor}
                textShadowRadius={1}
                textShadowOffset={{ width: -1.1, height: 1.1 }}
                textTransform="uppercase"
            >
                {text}
            </Text>
            <Text
                position="absolute"
                fontSize={14}
                marginLeft={marginHorizontal}
                color={color}
                textShadowColor={shadowColor}
                textShadowRadius={1}
                textShadowOffset={{ width: 1.1, height: -1.1 }}
                textTransform="uppercase"
            >
                {text}
            </Text>
        </View>
    );
}
