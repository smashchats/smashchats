import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/src/ui/components/ThemedText";
import { Colors } from "@/src/constants/Colors";

export const Button = ({
    title,
    onPress,
}: {
    title: string;
    onPress: () => void;
}) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <ThemedText
                style={{
                    color: Colors.textWhite,
                    margin: 0,
                    padding: 0,
                    marginBottom: 0,
                }}
            >
                {title}
            </ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.purple,
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        minWidth: 100,
    },
});
