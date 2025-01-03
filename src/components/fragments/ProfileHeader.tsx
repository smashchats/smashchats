import React, { PropsWithChildren } from "react";
import { Pressable, View, Alert } from "react-native";

import { useRouter } from "expo-router";
import { Image } from "expo-image";

import { TrustedContact } from "@/src/db/models/Contacts";
import { SmashOrPass } from "@/src/components/SmashOrPass";

export const ProfileHeaderWrapper = ({
    children,
    height,
}: PropsWithChildren<{ height: number }>) => {
    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
            }}
        >
            <View
                style={{
                    height: height,
                    maxHeight: height,
                }}
            >
                {children}
            </View>
        </View>
    );
};

export const ProfileHeader = ({
    peer,
    headerHeight,
}: {
    peer?: TrustedContact;
    headerHeight: number;
}) => {
    const router = useRouter();

    const totalHeight = headerHeight;

    return (
        <ProfileHeaderWrapper height={headerHeight}>
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: totalHeight,
                    maxHeight: totalHeight,
                    zIndex: 10,
                    paddingTop: 10,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                        paddingVertical: 5,
                    }}
                >
                    <Pressable onPress={() => router.dismissAll()}>
                        <Image
                            alt="Close profile"
                            style={{ width: 18, height: 18 }}
                            source={require("@/assets/icon_x.png")}
                        />
                    </Pressable>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {__DEV__ && (
                            <SmashOrPass
                                onPass={console.error}
                                onSmash={console.log}
                            />
                        )}
                        <Pressable
                            onPress={() => {
                                Alert.alert(
                                    "Report and block profile?",
                                    "This will notify the moderators of all neighborhoods and attach your chats with this profile to the report.",
                                    [
                                        {
                                            text: "Cancel",
                                            style: "cancel",
                                        },
                                        {
                                            text: "Report",
                                            onPress: () =>
                                                console.log("Report", peer),
                                        },
                                    ]
                                );
                            }}
                        >
                            <Image
                                alt="Report profile"
                                style={{ width: 18, height: 18 }}
                                source={require("@/assets/warning.png")}
                            />
                        </Pressable>
                    </View>
                </View>
            </View>
        </ProfileHeaderWrapper>
    );
};
