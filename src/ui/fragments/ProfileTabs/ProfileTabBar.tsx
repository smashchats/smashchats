import React, { useEffect } from "react";
import { Dimensions, TouchableOpacity, StyleSheet } from "react-native";

import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    interpolate,
    Extrapolation,
} from "react-native-reanimated";

import { Box, HStack } from "@/src/ui/design-system/layout";
import { Text } from "@/src/ui/design-system/Text";
import { Badge } from "@/src/ui/design-system/Badge";

type Props = MaterialTopTabBarProps & {
    onIndexChange?: (index: number) => void;
};

export function ProfileTabBar({
    state,
    descriptors,
    navigation,
    onIndexChange,
}: Props) {
    const { width } = Dimensions.get("window");
    const position = useSharedValue(0);

    useEffect(() => {
        position.value = withTiming(state.index, {
            duration: 250,
        });
        onIndexChange?.(state.index);
    }, [state.index, onIndexChange]);

    const badgeAnimatedStyle = useAnimatedStyle(() => {
        const totalWidth = width - 2 * 30;

        const badgeWidth = interpolate(
            position.value,
            [0, 1, 2],
            state.routes.map((route) => {
                const text = descriptors[route.key].options.title ?? route.name;
                return text.length * 12 + 16;
            }),
            Extrapolation.CLAMP
        );

        const translateX = interpolate(
            position.value,
            [0, 1, 2],
            [
                -3,
                totalWidth / 2 - badgeWidth / 2 - 10,
                totalWidth - badgeWidth - 2,
            ],
            Extrapolation.CLAMP
        );

        return {
            width: badgeWidth,
            transform: [{ translateX }],
        };
    });

    return (
        <Box
            margin={12}
            marginHorizontal={30}
            borderWidth={3}
            borderRadius={16}
            height={36}
            borderColor="grey"
        >
            <HStack
                justifyContent="space-between"
                flexDirection="row"
                display="flex"
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel ?? options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        });
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={
                                isFocused ? { selected: true } : {}
                            }
                            accessibilityLabel={
                                options.tabBarAccessibilityLabel
                            }
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={{
                                alignItems: "center",
                            }}
                        >
                            <Text
                                color="white"
                                textTransform="lowercase"
                                paddingHorizontal={16}
                                paddingVertical={6}
                            >
                                {label as string}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </HStack>
            <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
                <Badge
                    type="unselected"
                    borderWidth={4}
                    bgColor="transparent"
                    minHeight={36}
                />
            </Animated.View>
        </Box>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: "absolute",
        top: -3,
        height: 36,
    },
});
