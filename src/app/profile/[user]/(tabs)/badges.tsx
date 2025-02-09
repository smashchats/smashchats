import React, { forwardRef, memo } from "react";
import { StyleSheet, ScrollViewProps, View } from "react-native";

import { useLocalSearchParams } from "expo-router";
import Animated from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";

import { Colors } from "@/src/constants/Colors.js";
import { Text } from "@/src/ui/design-system/Text";
import { Badge } from "@/src/ui/components/Badge";
import { CategoryKey, categories } from "@/src/types/smash/badge.categories";
import { getCategories } from "@/src/utils/BadgeUtils";
import { badgeData } from "@/data/badges";

export const ProfileBadges = forwardRef<Animated.ScrollView, ScrollViewProps>(
    (props, ref) => {
        const { user: profileId } = useLocalSearchParams();
        console.log(profileId);

        const interests = ["cbt", "hung", "+18"].map((interest) =>
            interest.toLowerCase()
        );

        const unitPreferences = {
            length: "com.smashchats.units.cm",
            weight: "com.smashchats.units.kg",
        };

        return (
            <Animated.ScrollView
                ref={ref}
                style={styles.container}
                contentContainerStyle={styles.container}
                {...props}
            >
                <View style={{ paddingTop: 16 }}>
                    {badgeData.map((item) => (
                        <View
                            key={item.domain}
                            style={{
                                paddingHorizontal: 30,
                                marginBottom: 16,
                            }}
                        >
                            <Text fontSize={22} marginBottom={16}>
                                {item.domain}
                            </Text>
                            {getCategories(item.badges).map(
                                (key: CategoryKey) => (
                                    <View
                                        key={key}
                                        style={{ marginBottom: 16 }}
                                    >
                                        <Text
                                            fontSize={16}
                                            textTransform="lowercase"
                                            marginBottom={8}
                                        >
                                            {categories[key].title}
                                        </Text>
                                        <View style={styles.badgeContainer}>
                                            {item.badges
                                                .filter(
                                                    (badge) =>
                                                        badge.category === key
                                                )
                                                .map((badge) => (
                                                    <Badge
                                                        key={badge.id}
                                                        badge={badge}
                                                        unitPreferences={
                                                            unitPreferences
                                                        }
                                                        interests={interests}
                                                    />
                                                ))}
                                        </View>
                                    </View>
                                )
                            )}
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
                    <Text
                        fontSize={11}
                        textTransform="lowercase"
                        color={Colors.textLightGray}
                    >
                        <MaterialIcons name="verified" size={16} /> badges with
                        this icon are signed by an autjority you marked as
                        trusted.
                    </Text>
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
