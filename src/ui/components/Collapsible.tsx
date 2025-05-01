import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ThemedText } from "@/src/ui/components/ThemedText";
import { ThemedView } from "@/src/ui/components/ThemedView";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "@/src/hooks/useColorScheme";

export function Collapsible({
    children,
    title,
    open = false,
}: PropsWithChildren & { title: string; open?: boolean }) {
    const [isOpen, setIsOpen] = useState(open);
    const theme = useColorScheme() ?? "light";

    return (
        <ThemedView>
            <TouchableOpacity
                style={styles.heading}
                onPress={() => setIsOpen((value) => !value)}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={18}
                    color={
                        theme === "light" ? Colors.light.icon : Colors.dark.icon
                    }
                    style={{
                        transform: [{ rotate: isOpen ? "90deg" : "0deg" }],
                    }}
                />

                <ThemedText type="defaultSemiBold" style={{ color: "white" }}>
                    {title}
                </ThemedText>
            </TouchableOpacity>
            {isOpen && (
                <ThemedView style={styles.content}>{children}</ThemedView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    heading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    content: {
        marginTop: 6,
        marginLeft: 24,
    },
});
