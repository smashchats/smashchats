import { View, Text, StyleSheet, ScrollView } from "react-native";

import licenses from "@/assets/licenses.json";
import { usePostHog } from "posthog-react-native";
import { useEffect } from "react";

type License = {
    name: string;
    license: string;
};

export default function Licenses() {
    const posthog = usePostHog();

    useEffect(() => {
        posthog?.capture("licenses_viewed");
    }, [posthog]);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {licenses.map((license: License) => (
                    <View key={license.name} style={styles.license}>
                        <Text>{license.name}</Text>
                        <Text>{license.license}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollView: {
        padding: 16,
    },
    license: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
});
