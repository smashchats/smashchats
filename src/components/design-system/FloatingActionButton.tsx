import React from "react";
import { Pressable, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Colors } from "@/src/constants/Colors.js";
import { MaterialCommunityIcon } from "@/src/components/design-system/MaterialCommunityIconsType.js";

type Props = {
    icon: MaterialCommunityIcon;
    onPress: () => void;
};

export function FloatingActionButton({
    icon,
    onPress,
}: Readonly<Props>): JSX.Element {
    const { height } = useWindowDimensions();
    return (
        <Pressable
            testID="FloatingActionButton::Pressable"
            style={{
                zIndex: 999,
                width: 50,
                height: 50,
                position: "absolute",
                right: 0,
                top: height - 70,
                backgroundColor: Colors.purple,
                borderRadius: 25,
                marginRight: 20,
                marginBottom: 20,
                justifyContent: "center",
                alignItems: "center",
            }}
            onPress={() => {
                onPress();
            }}
        >
            <MaterialCommunityIcons name={icon} size={28} color={"white"} />
        </Pressable>
    );
}
