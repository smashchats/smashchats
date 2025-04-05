import { View } from "react-native";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { Text } from "@/src/ui/design-system/Text";

export type ProfileDetailsSheetProps = {
    didId: string;
};

function ProfileDetailsSheet({
    payload,
}: Readonly<SheetProps<"profile-details-sheet">>) {
    return (
        <ActionSheet>
            <View>
                <Text color="black">{payload?.didId}</Text>
            </View>
        </ActionSheet>
    );
}

export default ProfileDetailsSheet;
