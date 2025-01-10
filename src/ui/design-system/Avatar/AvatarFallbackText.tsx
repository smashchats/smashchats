import React from "react";
import { Text, View } from "react-native";

type Props = {
    name: string;
};

export function AvatarFallbackText({ name }: Readonly<Props>): JSX.Element {
    return (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
            }}
        >
            <Text style={{ fontSize: 24, color: "white", fontWeight: "bold" }}>
                {(name ?? "")
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
            </Text>
        </View>
    );
}
