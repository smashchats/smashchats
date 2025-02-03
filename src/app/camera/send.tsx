import React, { useState } from "react";
import { Button, FlatList, View } from "react-native";

import { useLocalSearchParams } from "expo-router";

import { SelectableContact } from "@/src/ui/components/SelectableContact";

export default function CameraSend() {
    const { mediaPath, mediaType, isMuted } = useLocalSearchParams();
    const isVideoMuted = isMuted === "true";

    // TODO: get contacts from the db ; sorted by most recent(?)
    const contacts = ["John Doe", "Jane Doe", "John Smith", "Jane Smith"];

    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

    const toggleContact = (contact: string) => {
        if (selectedContacts.includes(contact)) {
            setSelectedContacts(selectedContacts.filter((c) => c !== contact));
        } else {
            setSelectedContacts([...selectedContacts, contact]);
        }
    };
    const handleSend = () => {
        console.log(
            `TODO: send ${mediaType} found at ${mediaPath} to ${selectedContacts} with options ${
                isVideoMuted ? "muted" : "not muted"
            }`
        );
    };

    return (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <FlatList
                style={{ flex: 1, width: "100%" }}
                data={contacts}
                renderItem={({ item }) => {
                    return (
                        <SelectableContact
                            contact={{
                                meta_title: item,
                            }}
                            selected={selectedContacts.includes(item)}
                            onPress={() => toggleContact(item)}
                        />
                    );
                }}
            />
            <Button title="Send" onPress={handleSend} />
        </View>
    );
}
