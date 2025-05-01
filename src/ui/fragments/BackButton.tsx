import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@/src/ui/components/IconButton";

export const BackButton = ({ onPress }: { onPress?: () => void }) => {
    const insets = useSafeAreaInsets();
    return (
        <BareBackButton
            onPress={onPress}
            style={[styles.floatingBackButton, { top: insets.top + 20 }]}
        />
    );
};

export const BareBackButton = ({
    onPress,
    style,
}: {
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
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
    },
});
