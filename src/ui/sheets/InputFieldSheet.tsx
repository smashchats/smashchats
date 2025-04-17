import React, { useState } from "react";
import { View, TextInput, StyleSheet, Button } from "react-native";

import ActionSheet, {
    SheetManager,
    SheetProps,
} from "react-native-actions-sheet";

import { Text } from "@/src/ui/design-system/Text";

export interface InputFieldSheetProps {
    message: string;
    subMessage?: string;
    placeholder?: string;
}

const InputFieldSheet = (props: Readonly<SheetProps<"input-field-sheet">>) => {
    const [inputValue, setInputValue] = useState("");

    const handleCancel = () => {
        SheetManager.hide("input-field-sheet", {
            payload: undefined,
        });
    };

    const handleConfirm = () => {
        SheetManager.hide("input-field-sheet", {
            payload: inputValue,
        });
    };

    return (
        <ActionSheet id={props.sheetId}>
            <View style={styles.container}>
                <Text fontSize={16} marginBottom={16} color="black">
                    {props.payload?.message}
                </Text>
                {props.payload?.subMessage && (
                    <Text fontSize={12} marginBottom={16} color="black">
                        {props.payload?.subMessage}
                    </Text>
                )}
                <TextInput
                    style={styles.input}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder={props.payload?.placeholder}
                    testID="inputFieldSheetInput"
                />
                <View style={styles.buttonContainer}>
                    <Button
                        title="Cancel"
                        onPress={handleCancel}
                        testID="inputFieldSheetCancelButton"
                    />
                    <Button
                        title="Confirm"
                        onPress={handleConfirm}
                        testID="inputFieldSheetConfirmButton"
                    />
                </View>
            </View>
        </ActionSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    message: {
        fontSize: 16,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
    },
    button: {
        minWidth: 100,
    },
});

export default InputFieldSheet;
