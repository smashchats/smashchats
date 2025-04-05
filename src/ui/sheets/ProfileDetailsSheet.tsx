import {
    Button,
    View,
    TextInput,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
} from "react-native";
import ActionSheet, {
    SheetManager,
    SheetProps,
} from "react-native-actions-sheet";
import { Text } from "@/src/ui/design-system/Text";
import { useEffect, useState, useRef } from "react";
import {
    getContactWithTrustRelation,
    patchContact,
} from "@/src/db/models/Contacts";
import {
    createTrustRelation,
    deleteTrustRelation,
} from "@/src/db/models/TrustRelation";
import { TrustedContact } from "@/src/types/Contacts.types";

export type ProfileDetailsSheetProps = {
    didId: string;
};

function ProfileDetailsSheet({
    payload,
}: Readonly<SheetProps<"profile-details-sheet">>) {
    const [peer, setPeer] = useState<TrustedContact | null>(null);
    const [notes, setNotes] = useState<string>("");
    const notesInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const fetchPeer = async () => {
            if (payload?.didId) {
                const peerData = await getContactWithTrustRelation(
                    payload.didId
                );
                setPeer(peerData);
                setNotes(peerData.notes ?? "");
            }
        };
        fetchPeer();
    }, [payload?.didId]);

    const handleNotesBlur = async () => {
        if (payload?.didId) {
            const trimmedNotes = notes.trim();
            await patchContact(payload.didId, { notes: trimmedNotes });
            setNotes(trimmedNotes);
        }
    };

    const handleTrust = async (name: string | undefined) => {
        if (payload?.didId && name) {
            await createTrustRelation(payload.didId, name);
            const updatedPeer = await getContactWithTrustRelation(
                payload.didId
            );
            setPeer(updatedPeer);
        }
    };

    const handleUntrust = async () => {
        if (payload?.didId) {
            await deleteTrustRelation(payload.didId);
            const updatedPeer = await getContactWithTrustRelation(
                payload.didId
            );
            setPeer(updatedPeer);
        }
    };

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>
    ) => {
        if (e.nativeEvent.key === "Enter") {
            e.preventDefault();
            notesInputRef.current?.blur();
        }
    };

    return (
        <ActionSheet>
            <View style={{ padding: 20 }}>
                <Text color="black">{peer?.meta_title}</Text>
                {peer?.trusted_name ? (
                    <>
                        <Text color="black">
                            Trusted as: {peer.trusted_name}
                        </Text>
                        <Button title="Untrust" onPress={handleUntrust} />
                        <TextInput
                            ref={notesInputRef}
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 5,
                                padding: 10,
                                marginTop: 10,
                                minHeight: 100,
                                textAlignVertical: "top",
                            }}
                            multiline
                            returnKeyType="done"
                            placeholder="Add notes about this contact..."
                            value={notes}
                            onChangeText={(text) => setNotes(text)}
                            onBlur={handleNotesBlur}
                            onKeyPress={handleKeyPress}
                        />
                    </>
                ) : (
                    <Button
                        title="Trust User"
                        onPress={async () => {
                            const name = await SheetManager.show(
                                "input-field-sheet",
                                {
                                    payload: {
                                        message: "Give them a name",
                                        placeholder:
                                            "Their firstname or a nickname",
                                    },
                                }
                            );
                            handleTrust(name);
                        }}
                    />
                )}
            </View>
        </ActionSheet>
    );
}

export default ProfileDetailsSheet;
