import React from "react";
import { Pressable, View } from "react-native";

import { useRouter } from "expo-router";
import { Image } from "expo-image";

export const ProfileHeader = ({
    headerHeight,
    onExpand,
}: {
    headerHeight: number;
    onExpand: () => void;
}) => {
    const router = useRouter();

    const totalHeight = headerHeight;

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: totalHeight,
                maxHeight: totalHeight,
                zIndex: 10,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                }}
            >
                <Pressable
                    onPress={() => router.dismissAll()}
                    style={{
                        padding: 20,
                        marginLeft: -20,
                    }}
                >
                    <Image
                        alt="Close profile"
                        cachePolicy="memory-disk"
                        style={{ width: 18, height: 18 }}
                        source={require("@/assets/icon_x.png")}
                    />
                </Pressable>

                <Pressable
                    onPress={onExpand}
                    style={{
                        flex: 1,
                        height: "100%",
                        paddingVertical: 20,
                        marginVertical: -20,
                    }}
                />
            </View>
        </View>
    );
};
