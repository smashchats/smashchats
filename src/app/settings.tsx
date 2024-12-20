import { useEffect, useState } from "react";
import { Button, View, TextInput, Switch } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/src/components/ThemedText";
import { Avatar } from "@/src/components/Avatar";
import { TrustedContact } from "@/src/db/models/Contacts";
import { useGlobalState, useGlobalDispatch } from "@/src/context/GlobalContext";
import { Colors } from "@/src/constants/Colors";
import { convertImageToBase64, resizeImage } from "@/src/utils/Utils";

export default function ProfileLayout() {
    const dispatch = useGlobalDispatch();
    const state = useGlobalState();

    // Local state for input values
    const [inputTitle, setInputTitle] = useState(state.userMeta.title);
    const [inputDescription, setInputDescription] = useState(
        state.userMeta.description
    );

    useEffect(() => {
        setInputTitle(state.userMeta.title);
        setInputDescription(state.userMeta.description);
    }, [state.userMeta]);

    const handleInputTitleToMeta = () => {
        dispatch({
            type: "SET_SETTINGS_USER_META_ACTION",
            userMeta: {
                ...state.userMeta,
                title: inputTitle.trim(),
            },
        });
    };

    const handleInputDescriptionToMeta = () => {
        dispatch({
            type: "SET_SETTINGS_USER_META_ACTION",
            userMeta: {
                ...state.userMeta,
                description: inputDescription.trim(),
            },
        });
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // to allow user cropping it into a square
            aspect: [1, 1],
            quality: 0.5,
        });

        try {
            if (!result.canceled) {
                const uri = result.assets[0].uri;
                const resizedImage = await resizeImage(uri, {
                    quality: 50,
                    width: 150,
                    height: 150,
                });
                const base64 = await convertImageToBase64(resizedImage.uri);
                if (base64) {
                    dispatch({
                        type: "SET_SETTINGS_USER_META_ACTION",
                        userMeta: {
                            ...state.userMeta,
                            avatar: `data:image/jpeg;base64,${base64}`,
                        },
                    });
                }
            }
        } catch (error) {
            state.logger.error("Error picking image:", error);
        }
    };

    return (
        <SafeAreaView
            edges={["top", "bottom"]}
            style={{ flex: 1, padding: 15, backgroundColor: Colors.background }}
        >
            <View style={{ flex: 1, padding: 15 }}>
                <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                >
                    <Avatar
                        contact={
                            {
                                meta_avatar: state.userMeta.avatar,
                            } as TrustedContact
                        }
                        variant="xlarge"
                    />
                    <View style={{ marginTop: 15 }}>
                        <Button title="Change image" onPress={pickImage} />
                    </View>
                </View>
                <View style={{ marginTop: 20, width: "100%" }}>
                    <ThemedText
                        style={{
                            marginBottom: 10,
                            color: Colors.dark.text,
                        }}
                    >
                        Display Name
                    </ThemedText>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: Colors.textLightGray,
                            color: Colors.dark.text,
                            padding: 10,
                            borderRadius: 5,
                            width: "100%",
                        }}
                        placeholder="Enter your name"
                        placeholderTextColor={Colors.textLightGray}
                        value={inputTitle}
                        onChangeText={setInputTitle}
                        onEndEditing={handleInputTitleToMeta}
                        onBlur={handleInputTitleToMeta}
                    />
                </View>
                <View style={{ marginTop: 20, width: "100%" }}>
                    <ThemedText
                        style={{
                            marginBottom: 10,
                            color: Colors.dark.text,
                        }}
                    >
                        Description
                    </ThemedText>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: Colors.textLightGray,
                            color: Colors.dark.text,
                            padding: 10,
                            borderRadius: 5,
                            width: "100%",
                            height: 100,
                            textAlignVertical: "top",
                        }}
                        placeholder="Enter a description about yourself"
                        placeholderTextColor={Colors.textLightGray}
                        multiline={true}
                        numberOfLines={4}
                        value={inputDescription}
                        onEndEditing={handleInputDescriptionToMeta}
                        onBlur={handleInputDescriptionToMeta}
                        onChangeText={setInputDescription}
                    />
                </View>
                <View
                    style={{
                        marginTop: 20,
                        marginBottom: 20,
                        height: 1,
                        backgroundColor: Colors.textLightGray,
                        width: "100%",
                        opacity: 0.2,
                    }}
                />
                <ThemedText
                    style={{
                        fontSize: 16,
                        fontWeight: "500",
                        marginBottom: 10,
                        color: Colors.dark.text,
                    }}
                >
                    Privacy
                </ThemedText>
                <View style={{ marginTop: 20, width: "100%" }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <ThemedText
                            style={{
                                color: Colors.dark.text,
                            }}
                        >
                            Enable Analytics
                        </ThemedText>
                        <Switch
                            value={state.settings?.telemetryEnabled ?? false}
                            onValueChange={(value) => {
                                dispatch({
                                    type: "SET_SETTINGS_ACTION",
                                    settings: {
                                        ...state.settings,
                                        telemetryEnabled: value,
                                    },
                                });
                            }}
                        />
                    </View>
                    <ThemedText
                        style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: Colors.textLightGray,
                        }}
                    >
                        Help improve SmashChats by sharing anonymous usage data.
                        No personal information is collected.
                    </ThemedText>
                </View>
            </View>
        </SafeAreaView>
    );
}
