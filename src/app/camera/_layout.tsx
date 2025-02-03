import { Stack, router } from "expo-router";
import { Button } from "react-native";

const cancelButton = () => (
    <Button title="Cancel" onPress={() => router.back()} />
);

export default function CameraLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
                name="send"
                options={{
                    headerShown: true,
                    headerTitle: "Send",
                    headerLeft: cancelButton,
                }}
            />
        </Stack>
    );
}
