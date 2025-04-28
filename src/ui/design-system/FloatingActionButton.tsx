import React from "react";
import { View } from "react-native";

import { MaterialCommunityIcon } from "@/src/ui/design-system/MaterialCommunityIconsType";
import { SCREEN_HEIGHT } from "@/src/ui/constants";
import { IconButton } from "@/src/ui/components/IconButton";

type Props = {
    icon: MaterialCommunityIcon;
    onPress: () => void;
};

export function FloatingActionButton({
    icon,
    onPress,
}: Readonly<Props>): JSX.Element {
    return (
        <View
            style={{
                zIndex: 99,
                position: "absolute",
                right: 0,
                top: SCREEN_HEIGHT - 75,
                marginRight: 20,
                marginBottom: 20,
            }}
        >
            <IconButton
                icon={icon}
                onPress={onPress}
                size={28}
                variant="primary"
                buttonSize={50}
            />
        </View>
    );
}
