import React, { useCallback } from "react";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { Colors } from "@/src/constants/Colors";
import { TrustedContact } from "@/src/db/models/Contacts";
import { ThemedText } from "@/src/components/ThemedText";
import { Avatar } from "@/src/components/Avatar";

type ProfileDrawerProps = {
    peer: TrustedContact;
    bottomSheetRef: React.RefObject<BottomSheet>;
};

export const ProfileDrawer = ({ peer, bottomSheetRef }: ProfileDrawerProps) => {

    const handleSheetChanges = useCallback((index: number) => {
        const hasBeenClosed = index === -1;

        if (hasBeenClosed) {
            // save data changes to db
        }
    }, []);
    return (
        <BottomSheet
            ref={bottomSheetRef}
            onChange={handleSheetChanges}
            index={-1}
            snapPoints={["80%"]}
            enablePanDownToClose={true}
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
                    {peer?.trusted_name ?? peer?.meta_title ?? "No name"}
                </ThemedText>
                <ThemedText
                    style={{
                        color: Colors.darkGray,
                        fontSize: 16,
                        marginTop: 8,
                        textAlign: "center",
                    }}
                >
                    {peer?.meta_description
                        ? peer?.meta_description
                        : "No description available"}
                </ThemedText>
            </BottomSheetView>
        </BottomSheet>
    );
};
