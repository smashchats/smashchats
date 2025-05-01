import { StyleSheet, ViewStyle } from "react-native";

import { useRouter } from "expo-router";

import { IconButton } from "@/src/ui/components/IconButton";
import { INSETS } from "@/src/ui/constants";

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
        <IconButton
            icon="arrow-left"
            onPress={onPress ?? router.back}
            style={style}
        />
    );
};

const styles = StyleSheet.create({
    floatingBackButton: {
        position: "absolute",
        left: 20,
        top: INSETS.safeAreaInsetsTop + 20,
    },
});
