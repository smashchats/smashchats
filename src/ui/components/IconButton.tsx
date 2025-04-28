import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialCommunityIcon } from "@/src/ui/design-system/MaterialCommunityIconsType";

export const IconButton = ({
    onPress,
    icon,
    style,
}: {
    onPress: () => void;
    icon: MaterialCommunityIcon;
    style?: ViewStyle;
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.backButton, style]}
            onPress={onPress}
            testID={`IconButton::${icon}`}
        >
            <MaterialCommunityIcons
                name={icon}
                style={styles.backButtonIcon}
                size={24}
                color="white"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    backButton: {
        height: 45,
        width: 45,
        backgroundColor: "#00000055",
        borderRadius: 100,
    },
    backButtonIcon: {
        position: "absolute",
        left: 0,
        top: 0,
        padding: 10,
    },
});
