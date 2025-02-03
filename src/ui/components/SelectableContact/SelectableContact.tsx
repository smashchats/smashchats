import { TouchableOpacity, StyleSheet, View } from "react-native";

import { Text } from "@/src/ui/design-system/Text";
import { HStack } from "@/src/ui/design-system/layout";
import { Avatar } from "@/src/ui/components/Avatar";
import { Checkbox } from "@/src/ui/design-system/Checkbox";
import { Colors } from "@/src/constants/Colors";
import { ContactPreview } from "@/src/types/Contacts.types";

export type Props = {
    contact: ContactPreview;
    selected: boolean;
    onPress: () => void;
};

export const SelectableContact = ({
    contact,
    selected,
    onPress,
}: Readonly<Props>) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                testID="SelectableContact::Pressable"
                style={styles.contact}
                onPress={onPress}
            >
                <HStack alignItems="center">
                    <Avatar variant="small" contact={contact} />
                    <Text marginLeft={10} flex={1}>
                        {contact.trusted_name ??
                            contact.meta_title ??
                            "Unnamed contact"}
                    </Text>
                    <Checkbox checked={selected} />
                </HStack>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderBottomColor: Colors.darkerGray,
        borderBottomWidth: 1,
    },
    contact: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
