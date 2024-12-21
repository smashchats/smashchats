import React, { useCallback, useState } from "react";
import {
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
    View,
    TextInputEndEditingEventData,
} from "react-native";

import BottomSheet, {
    BottomSheetTextInput,
    BottomSheetView,
} from "@gorhom/bottom-sheet";

import { Colors } from "@/src/constants/Colors";
import { TrustedContact, patchContact } from "@/src/db/models/Contacts";
import { ThemedText } from "@/src/components/ThemedText";
import { Avatar } from "@/src/components/Avatar";
import { useKeyboard } from "@/src/hooks/useKeyboard";

type ProfileDrawerProps = {
    peer: TrustedContact;
    bottomSheetRef: React.RefObject<BottomSheet>;
};

export const ProfileDrawer = ({ peer, bottomSheetRef }: ProfileDrawerProps) => {
    const [notes, setNotes] = useState(peer.notes);
    const { Keyboard, isKeyboardVisible } = useKeyboard();

    const handleSheetChanges = useCallback((index: number) => {
        const hasBeenClosed = index === -1;

        if (hasBeenClosed) {
            if (isKeyboardVisible) {
                Keyboard.dismiss();
            }
        }
    }, []);

    function handleKeyPress(
        e: NativeSyntheticEvent<TextInputKeyPressEventData>
    ): void {
        if (e.nativeEvent.key === "Enter") {
            e.preventDefault();
            Keyboard.dismiss();
        }
    }

    function saveNotesToDatabase(): void {
        patchContact(peer.did_id, { notes: notes ?? "" }).then();
    }

    return (
        <BottomSheet
            ref={bottomSheetRef}
            onChange={handleSheetChanges}
            index={-1}
            snapPoints={["80%"]}
            enablePanDownToClose={!isKeyboardVisible}
            keyboardBlurBehavior="restore"
        >
            <BottomSheetView
                style={{
                    flex: 1,
                    padding: 36,
                    alignItems: "center",
                }}
            >
                <Avatar contact={peer} variant="large" />

                <ThemedText
                    style={{
                        color: Colors.darkGray,
                        fontSize: 20,
                        fontWeight: "bold",
                    }}
                >
                    {(peer.trusted_name ?? peer.meta_title) || "No name"}
                </ThemedText>
                <ThemedText
                    style={{
                        color: Colors.darkGray,
                        fontSize: 16,
                        marginTop: 8,
                        textAlign: "center",
                    }}
                >
                    {peer.meta_description || "No description available"}
                </ThemedText>

                <View style={{ marginTop: 20, width: "100%" }}>
                    <ThemedText
                        style={{
                            marginBottom: 10,
                            color: Colors.darkGray,
                        }}
                    >
                        Personal notes
                    </ThemedText>
                    <BottomSheetTextInput
                        style={{
                            borderWidth: 1,
                            borderColor: Colors.textLightGray,
                            color: Colors.darkGray,
                            padding: 10,
                            borderRadius: 5,
                            width: "100%",
                            // height: 100,
                            textAlignVertical: "top",
                            textAlign: "justify",
                        }}
                        placeholder={"These notes stay on your device."}
                        placeholderTextColor={Colors.textLightGray}
                        // multiline={true}
                        // numberOfLines={4}
                        keyboardType={"default"}
                        onKeyPress={handleKeyPress}
                        returnKeyType={"done"}
                        value={notes ?? ""}
                        onEndEditing={saveNotesToDatabase}
                        onChangeText={setNotes}
                    />
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
};
