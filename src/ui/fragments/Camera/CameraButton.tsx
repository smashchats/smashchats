import {
    Pressable,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { CONTENT_SPACING, CONTROL_BUTTON_SIZE } from "./Constants";
import { MaterialCommunityIcon } from "@/src/ui/design-system/MaterialCommunityIconsType";

export type CameraButtonProps = {
    icon: MaterialCommunityIcon;
    display?: boolean;
    onPress: () => void;
    marginBottom?: number;
};

export function CameraButton({
    icon,
    display = true,
    onPress,
    marginBottom = 0,
}: Readonly<CameraButtonProps>): JSX.Element {
    if (!display) return <></>;
    return (
        <Pressable
            testID="CameraButton::Pressable"
            style={[styles.button, { marginBottom }]}
            onPress={onPress}
        >
            <MaterialCommunityIcons name={icon} size={28} color={"white"} />
        </Pressable>
    );
}

type CameraButtonGroupProps = {
    buttons: CameraButtonProps[];
    style: StyleProp<ViewStyle>;
};

export function CameraButtonGroup({
    buttons,
    style,
}: Readonly<CameraButtonGroupProps>): JSX.Element {
    return (
        <View style={style}>
            {buttons.map((button, index) => (
                <CameraButton
                    key={button.icon}
                    {...button}
                    marginBottom={
                        index != buttons.length - 1 ? CONTENT_SPACING : 0
                    }
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        width: CONTROL_BUTTON_SIZE,
        height: CONTROL_BUTTON_SIZE,
        borderRadius: CONTROL_BUTTON_SIZE / 2,
        backgroundColor: "rgba(140, 140, 140, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
});
