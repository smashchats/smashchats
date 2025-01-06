import React from "react";
import { View } from "react-native";

import { TrustedContact } from "@/src/db/models/Contacts";
import { Avatar } from "@/src/components/Avatar";
import { Text } from "@/src/components/design-system/Text";

export const ProfileHeaderCollapsed = ({ peer }: { peer?: TrustedContact }) => {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flex: 1,
                marginHorizontal: 48,
                width: "50%",
            }}
        >
            <Avatar
                contact={peer ?? ({ meta_title: "" } as TrustedContact)}
                variant={"small"}
            />
            <Text
                fontWeight="bold"
                color="white"
                fontSize={16}
                zIndex={50}
                minHeight={20}
            >
                {peer?.trusted_name ?? peer?.meta_title}
            </Text>
        </View>
    );
};
