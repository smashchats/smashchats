import { BlurView } from "@react-native-community/blur";
import { useRouter } from "expo-router";
import { PropsWithChildren } from "react";

import React from "react";
import { Pressable, Platform, View, Alert } from "react-native";

import { Image } from "expo-image";

import Text from "@/src/components/design-system/Text.jsx";
import { TrustedContact } from "@/src/models/Contacts";
import { Avatar } from "@/src/components/Avatar";
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
            {Platform.OS === "ios" && (
                <BlurView
                    style={{
                        height: height,
                        maxHeight: height,
                    }}
                    blurType="light"
                    blurAmount={10}
                    reducedTransparencyFallbackColor="white"
                >
                    {children}
                </BlurView>
            )}
            {Platform.OS === "android" && (
                <View
                    style={{
                        height: height,
                        maxHeight: height,
                        backgroundColor: Colors.light.text,
                    }}
                >
                    {children}
                </View>
            )}
        </View>
    );
};

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";

export const ProfileHeader = ({
    peer,
    headerHeight,
}: {
    peer: TrustedContact;
    headerHeight: number;
}) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const totalHeight = insets.top + headerHeight;

    return (
        <ProfileHeaderWrapper height={totalHeight}>
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: totalHeight,
                    maxHeight: totalHeight,
                    zIndex: 10,
                    paddingTop: insets.top,
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
                    <Pressable onPress={() => router.back()}>
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
                            gap: 12,
                            flex: 1,
                            paddingHorizontal: 16,
                        }}
                    >
                        <Avatar
                            contact={
                                peer ?? ({ meta_title: "" } as TrustedContact)
                            }
                            variant={"small"}
                        />
                        <Text fontWeight="bold" color="white" fontSize={16}>
                            {peer?.trusted_name ?? peer?.meta_title}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {false && (
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
                                                console.log("Report"),
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
