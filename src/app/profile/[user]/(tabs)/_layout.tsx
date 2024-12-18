import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Pressable,
    TextInput,
    Platform,
    View,
    ScrollView,
} from "react-native";

import * as ScreenOrientation from "expo-screen-orientation";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/Colors.js";
import ProfileMessages from "@/src/app/profile/[user]/(tabs)/messages.jsx";
import { useGlobalState } from "@/src/context/GlobalContext.js";
import {
    MapContactToDid,
    TrustedContact,
    getContactWithTrustRelation,
} from "@/src/models/Contacts";
import { EnrichedSmashMessage, saveMessageToDb } from "@/src/models/Messages";
import { ProfileHeader } from "@/src/components/fragments/ProfileHeader";
import { DIDString } from "@smashchats/library";

export type ProfileIdType = {
    profileId: string;
    onRef: (ref: MutableRefObject<ScrollView>) => void;
};

export type ProfileStackParamList = {
    messages: ProfileIdType;
    pictures: ProfileIdType;
    badges: ProfileIdType;
};

export const ProfileScreen = () => {
    const { user } = useLocalSearchParams();
    const router = useRouter();
    const [newMessage, setNewMessage] = useState("");
    const [shouldShowSendIcon, setShouldShowSendIcon] = useState(true);
    const inputFieldRef = useRef<TextInput>(null);
    const globalState = useGlobalState();

    const [peer, setPeer] = useState<TrustedContact | null>(null);

    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchUser = async (did_id: string) => {
            try {
                const userData = await getContactWithTrustRelation(did_id);

                if (!userData) {
                    console.warn(`User ${user} not found in database`);
                    router.back();
                    return;
                }

                setPeer(userData);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                router.back();
            }
        };

        fetchUser(user as string);
    }, [user, router]);

    useEffect(() => {
        ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        return () => {
            ScreenOrientation.unlockAsync();
        };
    }, []);

    useEffect(() => {
        setShouldShowSendIcon(newMessage.length > 0);
    }, [newMessage]);

    if (!user) {
        router.back();
        return null;
    }

    const featureFlags = {
        show_pictures_and_badges: false,
        send_media: false,
        show_smash_or_pass: false,
    };

    let peerId = `${user}`;

    const handleSendMessage = async () => {
        const dataToSend = newMessage.trim();
        if (dataToSend.length === 0) {
            return;
        }
        setNewMessage("");

        const lastMessageId =
            globalState.latestMessageIdInDiscussion[peerId] ?? "0";

        const data = await globalState.selfSmashUser.sendTextMessage(
            MapContactToDid(peer!),
            dataToSend,
            lastMessageId
        );
        const selfDid = await globalState.selfSmashUser.getDID();

        saveMessageToDb(
            {
                ...data,
                fromDid: selfDid.id,
                toDiscussionId: peerId as DIDString,
            } satisfies EnrichedSmashMessage,
            {
                date_read: new Date(),
            }
        );
    };

    const handleSendMedia = async () => {
        if (!featureFlags.send_media) {
            return;
        }

        let { canceled, assets } = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.2,
        });
        if (canceled) {
            return;
        }
        console.info("assets", assets);
    };

    const headerHeight = 55;

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <ProfileHeader
                headerHeight={headerHeight}
                peer={peer ?? ({} as TrustedContact)}
            />

            {/* Chat Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{
                    flex: 1,
                    marginBottom: insets.bottom,
                    paddingBottom: insets.bottom,
                }}
            >
                <ProfileMessages paddingTop={headerHeight + insets.top} />

                <View
                    style={{
                        borderTopWidth: 1,
                        borderColor: Colors.darkGray,
                        padding: 10,
                        backgroundColor: Colors.background,
                    }}
                >
                    <TextInput
                        ref={inputFieldRef}
                        placeholder="Share something..."
                        placeholderTextColor={Colors.textGray}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        style={{
                            color: "white",
                            padding: 15,
                            paddingRight: 50,
                        }}
                    />
                    {shouldShowSendIcon && (
                        <Pressable
                            style={{
                                position: "absolute",
                                right: 20,
                                top: "50%",
                                transform: [{ translateY: -12 }],
                            }}
                            onPress={handleSendMessage}
                        >
                            <Feather
                                name="chevron-right"
                                size={24}
                                color="white"
                                style={{
                                    transform: [{ translateY: 10 }],
                                }}
                            />
                        </Pressable>
                    )}
                    {!shouldShowSendIcon && featureFlags.send_media && (
                        <Pressable
                            style={{
                                width: 50,
                                height: 50,
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                top: "50%",
                                transform: [{ translateY: -45 }],
                                backgroundColor: Colors.purple,
                                borderRadius: 25,
                                marginRight: 20,
                                marginBottom: 40,
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 999,
                            }}
                            onPress={handleSendMedia}
                        >
                            <Feather name="paperclip" size={28} color="white" />
                        </Pressable>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ProfileScreen;
