import React from "react";
import { View, StyleSheet } from "react-native";

import { TrustedContact } from "@/src/db/models/Contacts";
import { Avatar } from "@/src/ui/components/Avatar";
import { Text } from "@/src/ui/design-system/Text";

type Props = {
    peer?: TrustedContact;
    marginHorizontal?: number;
};

export const ProfileHeaderCollapsed = ({
    peer,
    marginHorizontal = 48,
}: Readonly<Props>) => {
    return (
        <View style={[styles.container, { marginHorizontal }]}>
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

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
        width: "50%",
    },
});
