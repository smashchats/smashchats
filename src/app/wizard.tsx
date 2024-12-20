import { useEffect, useState } from "react";
import { Button, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { IMProfile } from "@smashchats/library";

import { handleUserMessages, loadIdentity } from "@/src/utils/IdentityUtils";
import {
    DEFAULT_SETTINGS,
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext";
import { ThemedText } from "@/src/components/ThemedText";
import { Colors } from "@/src/constants/Colors";
import { Avatar } from "@/src/components/Avatar";
import { TrustedContact } from "@/src/db/models/Contacts";
import { convertImageToBase64, resizeImage } from "@/src/utils/Utils";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/src/hooks/useThemeColor";

export default function Wizard() {
    const dispatch = useGlobalDispatch();
    const globalState = useGlobalState();

    const router = useRouter();

    const [identityMeta, setIdentityMeta] = useState<IMProfile>({
        title: "",
        description: "",
        avatar: "",
    } as IMProfile);

    const [progress, setProgress] = useState("name");

    const isButtonDisabled =
        progress === "name" ? identityMeta.title.length === 0 : false;

    useEffect(() => {
        (async () => {
            const user = await loadIdentity(globalState.logger, "WARN");
            dispatch({
                type: "SET_USER_ACTION",
                user,
            });
            dispatch({
                type: "SET_SELF_DID_ACTION",
                selfDid: await user.getDID(),
            });
            handleUserMessages(user, globalState.logger);
        })();
    }, []);

    function handleCreateProfile() {
        (async () => {
            const meta = {
                title: identityMeta.title.trim(),
                description: identityMeta.description.trim(),
                avatar: (identityMeta.avatar ?? "").trim(),
            };
            dispatch({
                type: "SET_SETTINGS_ACTION",
                settings: DEFAULT_SETTINGS,
            });
            dispatch({
                type: "SET_SETTINGS_USER_META_ACTION",
                userMeta: meta as IMProfile,
            });

            dispatch({
                type: "SET_APP_WORKFLOW_ACTION",
                appWorkflow: "CONNECTED",
            });

            router.replace("/");
            await globalState.selfSmashUser.updateMeta(meta);
        })();
    }

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
                    setIdentityMeta((prev) => ({
                        ...prev,
                        avatar: `data:image/jpeg;base64,${base64}`,
                    }));
                }
            }
        } catch (error) {
            globalState.logger.error("Error picking image:", error);
        }
    };

    const textColor = useThemeColor({}, "text");

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                // alignItems: "center",
                paddingHorizontal: 20,
            }}
        >
            <ThemedText
                style={{
                    fontSize: 32,
                    lineHeight: 36,
                    fontWeight: "bold",
                    marginBottom: 30,
                }}
            >
                welcome to smash.
            </ThemedText>

            {progress === "name" && (
                <View style={{ width: "100%" }}>
                    <ThemedText>what's your name?</ThemedText>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: Colors.textLightGray,
                            color: textColor,
                            padding: 10,
                            borderRadius: 5,
                            width: "100%",
                        }}
                        value={identityMeta.title}
                        placeholderTextColor={Colors.textLightGray}
                        onChangeText={(text: string) =>
                            setIdentityMeta({
                                ...identityMeta,
                                title: text,
                            })
                        }
                        onSubmitEditing={() => {
                            if (!isButtonDisabled) setProgress("desc");
                        }}
                    />
                </View>
            )}
            {progress === "desc" && (
                <View style={{ width: "100%" }}>
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <ThemedText>tell us a bit about yourself.</ThemedText>
                        <ThemedText
                            style={{
                                fontSize: 12,
                                color: Colors.textLightGray,
                                marginLeft: 4,
                            }}
                        >
                            (optional)
                        </ThemedText>
                    </View>
                    <TextInput
                        value={identityMeta.description}
                        onChangeText={(text: string) =>
                            setIdentityMeta({
                                ...identityMeta,
                                description: text,
                            })
                        }
                        style={{
                            borderWidth: 1,
                            borderColor: Colors.textLightGray,
                            padding: 10,
                            height: 100,
                            color: textColor,
                            borderRadius: 5,
                            width: "100%",
                        }}
                        numberOfLines={4}
                        multiline
                    />
                </View>
            )}
            {progress === "avatar" && (
                <View style={{ width: "100%" }}>
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <ThemedText>upload an avatar</ThemedText>
                        <ThemedText
                            style={{
                                fontSize: 12,
                                color: Colors.textLightGray,
                                marginLeft: 4,
                            }}
                        >
                            (optional)
                        </ThemedText>
                    </View>
                    <View
                        style={{
                            alignItems: "center",
                            marginTop: 20,
                            justifyContent: "center",
                        }}
                    >
                        <Avatar
                            contact={
                                {
                                    meta_title: identityMeta.title,
                                    meta_description: identityMeta.description,
                                    meta_avatar: identityMeta.avatar,
                                } as TrustedContact
                            }
                            variant="xlarge"
                        />
                        <View style={{ marginTop: 15 }}>
                            <Button title="Change image" onPress={pickImage} />
                        </View>
                    </View>
                </View>
            )}
            <View style={{ width: "100%", marginTop: 20 }}>
                <Button
                    title="Next"
                    disabled={isButtonDisabled}
                    onPress={() => {
                        if (progress === "name") {
                            setProgress("desc");
                        } else if (progress === "desc") {
                            setProgress("avatar");
                        } else if (progress === "avatar") {
                            handleCreateProfile();
                        }
                    }}
                />
            </View>
        </View>
    );
}
