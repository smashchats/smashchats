import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const BackButton = ({ onPress }: { onPress?: () => void }) => {
    return (
        <BareBackButton onPress={onPress} style={styles.floatingBackButton} />
    );
};

export const BareBackButton = ({
    onPress,
    style,
}: {
    onPress?: () => void;
    style?: ViewStyle;
}) => {
    const router = useRouter();
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.backButton, style]}
            onPress={onPress ?? router.back}
            testID="BackButton"
        >
            <MaterialCommunityIcons
                name="arrow-left"
                style={styles.backButtonIcon}
                size={24}
                color="white"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    floatingBackButton: {
        position: "absolute",
        left: 20,
        top: 75,
    },
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
