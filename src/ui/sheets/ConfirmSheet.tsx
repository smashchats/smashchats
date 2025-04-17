import { Button, View } from "react-native";
import ActionSheet, {
    SheetManager,
    SheetProps,
} from "react-native-actions-sheet";
import { Text } from "@/src/ui/design-system/Text";
import { HStack } from "@/src/ui/design-system/layout";

export type ConfirmSheetProps = {
    message: string;
};

function ConfirmSheet(props: Readonly<SheetProps<"confirm-sheet">>) {
    return (
        <ActionSheet id={props.sheetId}>
            <View style={{ padding: 20 }}>
                <Text color="black" marginBottom={10}>
                    {props.payload?.message}
                </Text>
                <HStack justifyContent="space-between">
                    <Button
                        title="No"
                        testID="confirmSheetNoButton"
                        onPress={() => {
                            SheetManager.hide(props.sheetId, {
                                payload: false,
                            });
                        }}
                    />
                    <Button
                        title="Yes"
                        testID="confirmSheetYesButton"
                        onPress={() => {
                            SheetManager.hide(props.sheetId, {
                                payload: true,
                            });
                        }}
                    />
                </HStack>
            </View>
        </ActionSheet>
    );
}

export default ConfirmSheet;
