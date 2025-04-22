import { useEffect, useState } from "react";
import {
    Button,
    View,
    TextInput,
    Switch,
    StyleSheet,
    ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { Link } from "expo-router";
import * as Updates from "expo-updates";
import { ExpoUpdatesManifest } from "expo/config";
import { EmbeddedManifest } from "expo-manifests";

import { ThemedText } from "@/src/ui/components/ThemedText";
import { Avatar } from "@/src/ui/components/Avatar";
import { useGlobalState, useGlobalDispatch } from "@/src/context/GlobalContext";
import { Colors } from "@/src/constants/Colors";
import { PickImage } from "@/src/utils/ImageUtils";
import { InAppWebLink } from "@/src/ui/components/InAppWebLink/InAppWebLink";

const FEATURE_FLAG_ENABLE_AVATAR = false;

function Section({
    children,
    name,
}: Readonly<{
    children: React.ReactNode;
    name: string;
}>) {
    return (
        <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{name}</ThemedText>
            {children}
            <View style={styles.divider} />
        </View>
    );
}

const getVersion = () => {
    if (
        Updates.manifest &&
        "extra" in Updates.manifest &&
        (Updates.manifest as ExpoUpdatesManifest).extra.expoClient?.version
    ) {
        const manifest = Updates.manifest as ExpoUpdatesManifest;
        return `version ${manifest.extra.expoClient?.version} (${manifest.runtimeVersion} — ${manifest.id})`;
    }
    const manifest = Updates.manifest as EmbeddedManifest;
    if (typeof manifest === "object" && manifest !== null && "id" in manifest) {
        return `version ${manifest?.id} (${manifest?.commitTime})`;
    }
    return "development version";
};

export default function SettingsScreen() {
    const dispatch = useGlobalDispatch();
    const state = useGlobalState();

    const [inputTitle, setInputTitle] = useState(state.userMeta.title ?? "");
    const [inputDescription, setInputDescription] = useState(
        state.userMeta.description ?? ""
    );

    useEffect(() => {
        setInputTitle(state.userMeta.title ?? "");
        setInputDescription(state.userMeta.description ?? "");
    }, [state.userMeta]);

    useEffect(() => {
        (async () => {
            await WebBrowser.warmUpAsync();
        })();
    }, []);

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

    const pickAndSetImage = async () => {
        try {
            const base64 = await PickImage();
            if (base64) {
                dispatch({
                    type: "SET_SETTINGS_USER_META_ACTION",
                    userMeta: {
                        ...state.userMeta,
                        avatar: `data:image/jpeg;base64,${base64}`,
                    },
                });
            }
        } catch (error) {
            state.logger.error("Error picking image:", error);
        }
    };

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.safeAreaView}>
            <ScrollView
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="never"
                contentContainerStyle={{ paddingHorizontal: 20 }}
            >
                <Section name="your public profile">
                    {FEATURE_FLAG_ENABLE_AVATAR && (
                        <View style={styles.avatarContainer}>
                            <Avatar
                                contact={{ meta_avatar: state.userMeta.avatar }}
                                variant="xlarge"
                            />
                            <View style={styles.avatarButton}>
                                <Button
                                    title="Change image"
                                    onPress={pickAndSetImage}
                                />
                            </View>
                        </View>
                    )}
                    <View style={styles.inputContainer}>
                        <ThemedText style={styles.inputLabel}>
                            Display Name
                        </ThemedText>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your name"
                            placeholderTextColor={Colors.textLightGray}
                            value={inputTitle}
                            onChangeText={setInputTitle}
                            onEndEditing={handleInputTitleToMeta}
                            onBlur={handleInputTitleToMeta}
                        />
                    </View>
                    <View style={[styles.inputContainer, { marginTop: 20 }]}>
                        <ThemedText style={styles.inputLabel}>
                            Description
                        </ThemedText>
                        <TextInput
                            style={[styles.textInput, styles.descriptionInput]}
                            placeholder="Enter a description about yourself"
                            placeholderTextColor={Colors.textLightGray}
                            multiline
                            numberOfLines={4}
                            value={inputDescription}
                            onChangeText={setInputDescription}
                            onEndEditing={handleInputDescriptionToMeta}
                            onBlur={handleInputDescriptionToMeta}
                        />
                    </View>
                </Section>

                <Section name="privacy">
                    <View style={styles.row}>
                        <ThemedText style={{ color: Colors.dark.text }}>
                            Enable Analytics
                        </ThemedText>
                        <Switch
                            value={state.settings?.telemetryEnabled ?? false}
                            onValueChange={(value) =>
                                dispatch({
                                    type: "SET_SETTINGS_ACTION",
                                    settings: {
                                        ...state.settings,
                                        telemetryEnabled: value,
                                    },
                                })
                            }
                        />
                    </View>
                    <ThemedText style={styles.description}>
                        Help improve SmashChats by sharing anonymous usage data.
                        No personal information is collected.
                    </ThemedText>
                    <InAppWebLink
                        style={styles.link}
                        textStyle={styles.linkText}
                        url="https://smashchats.com/privacy"
                        text="Privacy Policy"
                    />
                </Section>

                <Section name="about">
                    <InAppWebLink
                        url="https://smashchats.com/"
                        text="About smashchats"
                        textStyle={styles.linkText}
                    />
                    <InAppWebLink
                        style={styles.link}
                        url="https://dev.smashchats.com/"
                        text="I'm a developer"
                        textStyle={styles.linkText}
                    />
                    <Link href="/licenses" style={styles.link}>
                        <ThemedText
                            style={[
                                styles.linkText,
                                { textDecorationLine: "underline" },
                            ]}
                        >
                            Licenses
                        </ThemedText>
                    </Link>
                </Section>
                <View style={{ alignItems: "center" }}>
                    <ThemedText
                        style={{ color: Colors.dark.darkGray, fontSize: 12 }}
                    >
                        {getVersion()}
                    </ThemedText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
        color: Colors.dark.text,
    },
    description: {
        marginTop: 8,
        fontSize: 12,
        color: Colors.textLightGray,
    },
    link: {
        marginTop: 20,
    },
    linkText: {
        color: Colors.dark.text,
    },
    safeAreaView: {
        flex: 1,
        padding: 15,
        backgroundColor: Colors.background,
    },
    viewContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    avatarContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    avatarButton: {
        marginTop: 15,
    },
    inputContainer: {
        width: "100%",
    },
    inputLabel: {
        marginBottom: 10,
        color: Colors.dark.text,
    },
    textInput: {
        borderWidth: 1,
        borderColor: Colors.textLightGray,
        color: Colors.dark.text,
        padding: 10,
        borderRadius: 5,
        width: "100%",
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: "top",
    },
    divider: {
        marginTop: 20,
        marginBottom: 20,
        height: 1,
        backgroundColor: Colors.textLightGray,
        width: "100%",
        opacity: 0.2,
    },
});
