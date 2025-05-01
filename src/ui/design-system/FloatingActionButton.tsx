import React from "react";
import { View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                zIndex: 99,
                position: "absolute",
                right: 0,
                top: SCREEN_HEIGHT - insets.bottom - insets.top,
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
