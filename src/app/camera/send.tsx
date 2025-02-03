import React, { useEffect, useState } from "react";
import { Button, FlatList, View } from "react-native";

import { useLocalSearchParams } from "expo-router";

import { SelectableContact } from "@/src/ui/components/SelectableContact";
import { drizzle_db } from "@/src/db/database";
import { Contact } from "@/src/db/models/Contacts";

export default function CameraSend() {
    const { mediaPath, mediaType, isMuted } = useLocalSearchParams();
    const isVideoMuted = isMuted === "true";

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

    useEffect(() => {
        const fetchContacts = async () => {
            const contacts = await drizzle_db.query.contacts.findMany();
            setContacts(contacts);
        };
        fetchContacts();
    }, []);

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
                            contact={item}
                            selected={selectedContacts.includes(item.did_id)}
                            onPress={() => toggleContact(item.did_id)}
                        />
                    );
                }}
            />
            <Button title="Send" onPress={handleSend} />
        </View>
    );
}
