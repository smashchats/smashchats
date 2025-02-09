import { MaterialIcons } from "@expo/vector-icons";

import { Badge as DSBadge } from "@/src/ui/design-system/Badge";
import { badgeToString } from "@/src/utils/BadgeUtils";
import { Colors } from "@/src/constants/Colors";
import { Text } from "@/src/ui/design-system/Text";
import { UnitKey } from "@/src/types/smash/units";
import { Badge as BadgeType } from "@/src/types/smash/badge.categories";

const Badge = ({
    badge,
    unitPreferences,
    interests,
}: {
    badge: BadgeType;
    unitPreferences: Record<string, UnitKey>;
    interests: string[];
}) => {
    return (
        <DSBadge
            key={badge.id}
            borderRadius={16}
            bgColor={
                interests.includes(
                    badgeToString(badge.value, unitPreferences).toLowerCase()
                )
                    ? Colors.purple
                    : Colors.background
            }
            borderColor={Colors.purple}
            borderWidth={2}
        >
            <Text textTransform="uppercase" fontSize={12}>
                {badgeToString(badge.value, unitPreferences)}
                {badge.endorsements && ` (${badge.endorsements})`}
            </Text>
            {badge.verified && (
                <MaterialIcons
                    style={{
                        marginLeft: 5,
                    }}
                    name="verified"
                    size={16}
                    color={"white"}
                />
            )}
        </DSBadge>
    );
};

export { Badge };
