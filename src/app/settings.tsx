import { useEffect, useState } from "react";
import { Button, View, TextInput, Switch } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import { SmashProfileMeta } from "smash-node-lib";

import { ThemedText } from "@/src/components/ThemedText";
import { Avatar } from "@/src/components/Avatar";
import { TrustedContact } from "@/src/models/Contacts";
import { getData, saveData } from "@/src/StorageUtils";
import {
    DEFAULT_SETTINGS,
    useGlobalState,
    Settings,
} from "@/src/context/GlobalContext";
import { Colors } from "@/src/constants/Colors";
import { convertImageToBase64, resizeImage } from "@/src/Utils";
import { useThemeColor } from "@/src/hooks/useThemeColor";

export default function ProfileLayout() {
    const [loaded, setLoaded] = useState(false);
    const [meta, setMeta] = useState<{
        title: string;
        description: string;
        picture: string;
    }>({
        title: "",
        description: "",
        picture: "",
    });

    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    // Local state for input values
    const [inputTitle, setInputTitle] = useState(meta.title);
    const [inputDescription, setInputDescription] = useState(meta.description);

    const { selfSmashUser: user } = useGlobalState();

    useEffect(() => {
        (async () => {
            const [userMeta, settings] = await Promise.all([
                getData<SmashProfileMeta>("settings.user_meta"),
                getData<Settings>("settings.settings"),
            ]);
            setInputTitle(userMeta?.title?.trim() ?? "");
            setInputDescription(userMeta?.description?.trim() ?? "");
            setMeta({
                ...(userMeta ?? {
                    title: "",
                    description: "",
                    picture: "",
                }),
            });
            setSettings({ ...(settings ?? DEFAULT_SETTINGS) });
            setLoaded(true);
        })();
    }, []);

    useEffect(() => {
        if (loaded) {
            (async () => {
                await saveData<Settings>("settings.settings", settings);
            })();
        }
    }, [settings]);

    useEffect(() => {
        if (user && loaded) {
            (async () => {
                await user.updateMeta({
                    title: meta.title.trim(),
                    description: meta.description.trim(),
                    picture: meta.picture.trim(),
                });
                await saveData<SmashProfileMeta>("settings.user_meta", meta);
            })();
        }
    }, [user, meta, loaded]);

    const handleInputTitleToMeta = () => {
        setMeta((prev) => ({ ...prev, title: inputTitle.trim() }));
    };

    const handleInputDescriptionToMeta = () => {
        setMeta((prev) => ({
            ...prev,
            description: inputDescription.trim(),
        }));
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
                    setMeta((prev) => ({
                        ...prev,
                        picture: `data:image/jpeg;base64,${base64}`,
                    }));
                }
            }
        } catch (error) {
            console.error("Error picking image:", error);
        }
    };

    const textColor = useThemeColor({}, "text");

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
                            { meta_picture: meta.picture } as TrustedContact
                        }
                        variant="xlarge"
                    />
                    <View style={{ marginTop: 15 }}>
                        <Button title="Change image" onPress={pickImage} />
                    </View>
                </View>
                <View style={{ marginTop: 20, width: "100%" }}>
                    <ThemedText style={{ marginBottom: 10 }}>
                        Display Name
                    </ThemedText>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: Colors.textLightGray,
                            color: textColor,
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
                    <ThemedText style={{ marginBottom: 10 }}>
                        Description
                    </ThemedText>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: Colors.textLightGray,
                            color: textColor,
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
                        <ThemedText>Enable Analytics</ThemedText>
                        <Switch
                            value={settings.telemetryEnabled}
                            onValueChange={(value) => {
                                setSettings((old) => ({
                                    ...old,
                                    telemetryEnabled: value,
                                }));
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
