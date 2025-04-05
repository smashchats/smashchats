import { Stack } from "expo-router";
import SecretScreen from "@/src/ui/screens/SecretScreen";

export default function SecretRoute() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: "Secret",
                    headerShown: true,
                }}
            />
            <SecretScreen />
        </>
    );
}
