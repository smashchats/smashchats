import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet } from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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
        // BUG: for some reason, the router.dismissAll() doesn't work
        // so we need to do it manually several times ; does it have to do with the nested navigation?
        do {
            router.dismissAll();
        } while (router.canGoBack());
    };

    return (
        <SafeAreaView
            edges={["right", "bottom", "left"]}
            style={styles.container}
        >
            <FlatList
                style={styles.container}
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
            <Button
                disabled={selectedContacts.length === 0}
                title="Send"
                onPress={handleSend}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
