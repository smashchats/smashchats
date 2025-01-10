import React, { useEffect } from "react";
import { Dimensions, TouchableOpacity } from "react-native";

import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";

import { Box, HStack } from "@/src/ui/design-system/layout";
import { Text } from "@/src/ui/design-system/Text";
import { Badge, BadgeText } from "@/src/ui/design-system/Badge";

// At some point, come back here and try to implement this: https://github.com/react-navigation/react-navigation/blob/main/packages/react-native-tab-view/src/TabBarIndicator.tsx

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

    const positionsLeft = [-3, width / 2 - 89, undefined];
    const positionsRight = [undefined, undefined, -3];
    const { index } = state;

    useEffect(() => {
        onIndexChange?.(index);
    }, [onIndexChange, index]);

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
            <Badge
                type="unselected"
                borderWidth={4}
                position="absolute"
                bgColor="transparent"
                top={-3}
                height={36}
                left={positionsLeft[state.index]}
                right={positionsRight[state.index]}
            >
                <BadgeText paddingHorizontal={8} opacity={0}>
                    {descriptors[state.routes[state.index].key].options.title}
                </BadgeText>
            </Badge>
        </Box>
    );
}
