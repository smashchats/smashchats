import React from "react";
import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialCommunityIcon } from "@/src/ui/design-system/MaterialCommunityIconsType";

import { Colors } from "@/src/constants/Colors.js";
import { SCREEN_HEIGHT } from "@/src/ui/constants";

type Props = {
    icon: MaterialCommunityIcon;
    onPress: () => void;
};

export function FloatingActionButton({
    icon,
    onPress,
}: Readonly<Props>): JSX.Element {
    return (
        <Pressable
            testID="FloatingActionButton::Pressable"
            style={{
                zIndex: 99,
                width: 50,
                height: 50,
                position: "absolute",
                right: 0,
                top: SCREEN_HEIGHT - 75,
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
