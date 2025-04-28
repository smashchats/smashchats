import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from "react-native-reanimated";

import { ThemedText } from "@/src/ui/components/ThemedText";
import { Colors } from "@/src/constants/Colors";

const MARGIN = 4;

export const TabBar = ({
    active,
    buttons,
}: {
    active: "scan" | "show";
    buttons: {
        label: string;
        id: "scan" | "show";
        onPress: () => void;
    }[];
}) => {
    const animatedPosition = useSharedValue(active === "scan" ? 0 : 1);

    const [containerWidth, setContainerWidth] = useState(0);
    const buttonWidth = containerWidth / 2 - 5;

    useEffect(() => {
        animatedPosition.value = withTiming(active === "scan" ? 0 : 1, {
            duration: 250,
        });
    }, [active, animatedPosition]);

    const animatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            animatedPosition.value,
            [0, 1],
            [0, buttonWidth]
        );

        return {
            transform: [{ translateX }],
        };
    });

    return (
        <View
            style={styles.buttonContainer}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            <Animated.View
                style={[
                    styles.animatedBackground,
                    {
                        width: `${100 / buttons.length}%`,
                        marginTop: MARGIN,
                    },
                    animatedStyle,
                ]}
            />
            {buttons.map((button) => (
                <TouchableOpacity
                    key={button.label}
                    activeOpacity={0.8}
                    onPress={button.onPress}
                    style={{
                        flex: 1,
                        padding: 10,
                        paddingHorizontal: 20,
                        borderRadius: 100,
                        alignItems: "center",
                        zIndex: 1,
                    }}
                >
                    <ThemedText
                        style={{
                            marginBottom: 4,
                            marginTop: 4,
                            color:
                                button.id === active
                                    ? Colors.textWhite
                                    : Colors.textLightGray,
                        }}
                    >
                        {button.label}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: "black",
        borderRadius: 100,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
        alignItems: "center",
        width: "80%",
        padding: 3,
        position: "relative",
        height: 60,
    },
    animatedBackground: {
        position: "absolute",
        height: 60 - 2 * MARGIN,
        backgroundColor: Colors.darkGray,
        borderRadius: 100,
        marginLeft: MARGIN,
        marginRight: MARGIN,
        left: 0,
        top: 0,
    },
});
