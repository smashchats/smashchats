import { Button, View } from "react-native";
import ActionSheet, {
    SheetManager,
    SheetProps,
} from "react-native-actions-sheet";
import { Text } from "@/src/ui/design-system/Text";
import { useEffect, useState } from "react";
import { getContactWithTrustRelation } from "@/src/db/models/Contacts";
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

    useEffect(() => {
        const fetchPeer = async () => {
            if (payload?.didId) {
                const peerData = await getContactWithTrustRelation(
                    payload.didId
                );
                setPeer(peerData);
            }
        };
        fetchPeer();
    }, [payload?.didId]);

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
