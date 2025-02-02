import { Pressable, StyleSheet } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { CONTENT_SPACING, CONTROL_BUTTON_SIZE } from "./Constants";
import { MaterialCommunityIcon } from "@/src/ui/design-system/MaterialCommunityIconsType";

export type CameraButtonProps = {
    icon: MaterialCommunityIcon;
    display?: boolean;
    onPress: () => void;
};

export function CameraButton({
    icon,
    display = true,
    onPress,
}: Readonly<CameraButtonProps>): JSX.Element {
    if (!display) return <></>;
    return (
        <Pressable
            testID="CameraButton::Pressable"
            style={styles.button}
            onPress={onPress}
        >
            <MaterialCommunityIcons name={icon} size={28} color={"white"} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        marginBottom: CONTENT_SPACING,
        width: CONTROL_BUTTON_SIZE,
        height: CONTROL_BUTTON_SIZE,
        borderRadius: CONTROL_BUTTON_SIZE / 2,
        backgroundColor: "rgba(140, 140, 140, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
});
