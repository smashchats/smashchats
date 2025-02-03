import { StyleSheet, TouchableHighlight } from "react-native";

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
        <TouchableHighlight
            activeOpacity={0.6}
            underlayColor={Colors.darkerGray}
            testID="SelectableContact::Pressable"
            style={styles.container}
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
        </TouchableHighlight>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderBottomColor: Colors.darkerGray,
        borderBottomWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
