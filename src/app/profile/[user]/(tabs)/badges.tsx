import React, { forwardRef, memo } from "react";
import {
    StyleSheet,
    ScrollViewProps,
    View,
    TouchableOpacity,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import Animated from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";

import { badgeData, interests, unitPreferences } from "@/data/badges";

import { Colors } from "@/src/constants/Colors.js";
import { Text } from "@/src/ui/design-system/Text";
import { Badge } from "@/src/ui/components/Badge";
import { CategoryKey, categories } from "@/src/types/smash/badge.categories";
import { getCategories } from "@/src/utils/BadgeUtils";
import { HStack } from "@/src/ui/design-system/layout";

const NeighbourhoodCategoriesAndBadges = ({
    neighbourhood,
    handleOpenBadgeDetailsSheet,
}: {
    neighbourhood: (typeof badgeData)[number];
    handleOpenBadgeDetailsSheet: (
        badge: (typeof badgeData)[number]["badges"][number]
    ) => void;
}) => {
    return (
        <>
            <Text fontSize={22} marginBottom={16}>
                {neighbourhood.domain}
            </Text>
            {getCategories(neighbourhood.badges).map((key: CategoryKey) => (
                <View key={key} style={{ marginBottom: 16 }}>
                    <Text
                        fontSize={16}
                        textTransform="lowercase"
                        marginBottom={8}
                    >
                        {categories[key].title}
                    </Text>
                    <View style={styles.badgeContainer}>
                        {neighbourhood.badges
                            .filter((badge) => badge.category === key)
                            .map((badge) => (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    key={badge.id}
                                >
                                    <Badge
                                        badge={badge}
                                        unitPreferences={unitPreferences}
                                        interests={interests}
                                    />
                                </TouchableOpacity>
                            ))}
                    </View>
                </View>
            ))}
        </>
    );
};

export const ProfileBadges = forwardRef<Animated.ScrollView, ScrollViewProps>(
    function ProfileBadges(props, ref) {
        const { user: profileId } = useLocalSearchParams();

        const handleOpenBadgeDetailsSheet = (
            badge: (typeof badgeData)[number]["badges"][number]
        ) => {
            SheetManager.show("badge-details-sheet", {
                payload: {
                    badge,
                    profileId: profileId as string,
                },
            });
        };

        return (
            <Animated.ScrollView
                ref={ref}
                style={styles.container}
                contentContainerStyle={styles.container}
                {...props}
            >
                <View style={{ paddingTop: 16 }}>
                    {badgeData.map((neighbourhood) => (
                        <View
                            key={neighbourhood.domain}
                            style={{
                                paddingHorizontal: 30,
                                marginBottom: 16,
                            }}
                        >
                            <NeighbourhoodCategoriesAndBadges
                                neighbourhood={neighbourhood}
                                handleOpenBadgeDetailsSheet={
                                    handleOpenBadgeDetailsSheet
                                }
                            />
                        </View>
                    ))}
                </View>
                <View style={{ paddingHorizontal: 30, paddingVertical: 16 }}>
                    <Text
                        fontSize={11}
                        textTransform="lowercase"
                        color={Colors.textLightGray}
                        marginBottom={16}
                    >
                        tap on a badge to see more
                    </Text>
                    <HStack alignItems="center">
                        <MaterialIcons
                            name="verified"
                            size={16}
                            color={Colors.textLightGray}
                        />
                        <Text
                            marginLeft={4}
                            fontSize={11}
                            textTransform="lowercase"
                            color={Colors.textLightGray}
                        >
                            badges with this icon are signed by an authority you
                            marked as trusted
                        </Text>
                    </HStack>
                </View>
            </Animated.ScrollView>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
    },
    badgeContainer: {
        flexDirection: "row",
        gap: 4,
        flexWrap: "wrap",
        flex: 1,
    },
});

export default memo(ProfileBadges);
