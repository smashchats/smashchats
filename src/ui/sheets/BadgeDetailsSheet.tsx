import React, { useState } from "react";
import { View, StyleSheet, Button, TouchableOpacity } from "react-native";

import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import { Text } from "@/src/ui/design-system/Text";
import { Badge } from "@/src/types/smash/badge.categories";
import { badgeToString } from "@/src/utils/BadgeUtils";
import { Badge as SmashBadge } from "@/src/ui/components/Badge/Badge";
import { Badge as DSBadge } from "@/src/ui/design-system/Badge";
import { HStack } from "@/src/ui/design-system/layout";
import { Colors } from "@/src/constants/Colors";
import { unitPreferences, interests } from "@/data/badges";

export interface BadgeDetailsSheetProps {
    badge: Badge;
    profileId?: string;
}

const BadgeDetailsSheet = (
    props: Readonly<SheetProps<"badge-details-sheet">>
) => {
    const canAddToInterests = [
        "com.smashchats.badges.interests",
        "com.smashchats.badges.attributes",
    ].includes(props.payload?.badge.category ?? "");

    const isUserInterested = interests.includes(
        badgeToString(
            props.payload?.badge.value!,
            unitPreferences
        ).toLowerCase()
    );

    const [isInterested, setIsInterested] = useState(isUserInterested);

    const handleEndorse = () => {};

    const toggleInterest = () => {
        setIsInterested(!isInterested);
    };

    // TODO fix design (missing in Figma)
    return (
        <ActionSheet id={props.sheetId}>
            <View style={styles.container}>
                <Text fontSize={16} marginBottom={16} color="black">
                    {badgeToString(
                        props.payload?.badge.value!,
                        unitPreferences
                    )}
                </Text>

                <HStack marginBottom={16}>
                    <SmashBadge
                        badge={props.payload?.badge!}
                        unitPreferences={unitPreferences}
                        interests={interests}
                    />

                    {canAddToInterests && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={toggleInterest}
                        >
                            <MaterialCommunityIcons
                                name={isInterested ? "heart" : "heart-outline"}
                                style={{ marginLeft: 8 }}
                                size={20}
                                color={Colors.purple}
                            />
                        </TouchableOpacity>
                    )}
                </HStack>

                {props.payload?.badge.endorsements && (
                    <Text fontSize={16} marginBottom={16} color="black">
                        Endorsements: {props.payload?.badge.endorsements}
                    </Text>
                )}

                <Text fontSize={16} marginBottom={16} color="black">
                    Delivered by: 'Smash Corp.'
                </Text>

                {props.payload?.badge.verified && (
                    <MaterialIcons name="verified" size={16} color={"gold"} />
                )}

                <DSBadge>
                    <Text textTransform="uppercase" fontSize={12}>
                        Verified
                    </Text>
                    <MaterialIcons
                        style={{
                            marginLeft: 5,
                        }}
                        name="verified"
                        size={16}
                        color={"gold"}
                    />
                </DSBadge>

                {props.payload?.profileId !== undefined && (
                    <Button
                        title="Approve badge / Endorse"
                        onPress={handleEndorse}
                    />
                )}
            </View>
        </ActionSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});

export default BadgeDetailsSheet;
