import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Button as RNButton,
    TextInput,
    Switch,
} from "react-native";

import ActionSheet, {
    SheetManager,
    SheetProps,
} from "react-native-actions-sheet";
import { useRouter } from "expo-router";

import { IM_MEDIA_EMBEDDED } from "@smashchats/library";

import { useGlobalState } from "@/src/context/GlobalContext";
import { ThemedText } from "@/src/ui/components/ThemedText";
import { Contact, blockContact } from "@/src/db/models/Contacts";
import { Colors } from "@/src/constants/Colors";
import { Button as Button2 } from "@/src/ui/components/Button";
import { MapContactToDidDocument } from "@/src/utils/mappers/contacts";
import { useMessages } from "@/src/hooks/useMessages";
export interface ReportSheetProps {
    peer: Contact;
}

export enum ModalMode {
    DEFAULT = "default",
    REPORT_REASON = "report-reason",
    REPORT_DETAILS = "report-details",
}

const SAFETY_REPORT_URL = __DEV__
    ? "https://safety-reporting.dev.smashchats.com/v0/report"
    : "https://safety-reporting.smashchats.com/v0/report";

const ReportSheet = (props: Readonly<SheetProps<"report-sheet">>) => {
    const [inputValue, setInputValue] = useState("");
    const { selfSmashUser, userMeta } = useGlobalState();

    const [mode, setMode] = useState<ModalMode>(ModalMode.DEFAULT);
    const [joinMessages, setJoinMessages] = useState<boolean>(false);
    const [reportReason, setReportReason] = useState<string>("");

    const router = useRouter();

    const { messages } = useMessages(props.payload?.peer.did_id!, () => {});

    const handleCancel = () => {
        SheetManager.hide("report-sheet");
    };

    const handleReportReason = (reason: string) => {
        setReportReason(reason);
        setMode(ModalMode.REPORT_DETAILS);
    };

    const sendReportAndBlock = async () => {
        try {
            const report = {
                reportee: {
                    did: MapContactToDidDocument(props.payload?.peer!),
                    bio: {
                        name: props.payload?.peer.meta_title,
                        description: props.payload?.peer.meta_description,
                    },
                    extra: {
                        ...props.payload?.peer,
                    },
                },
                reporter: {
                    did: selfSmashUser?.did,
                    bio: {
                        name: userMeta?.title,
                        description: userMeta?.description,
                    },
                },
                messages: joinMessages
                    ? messages
                          .filter((m) => !m.type.startsWith("system"))
                          .map((m) => {
                              let content = m.content;
                              if (m.type === IM_MEDIA_EMBEDDED) {
                                  const parts = m.content.toString().split("/");
                                  content = `File: [${
                                      parts[parts.length - 1]
                                  }]`;
                              }
                              return {
                                  id: m.sha256,
                                  content,
                                  date: m.date,
                                  author: m.from,
                              };
                          })
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                    : [],
                reason: reportReason,
                details: inputValue,
            };
            await fetch(SAFETY_REPORT_URL, {
                method: "POST",
                body: JSON.stringify(report),
            });

            handleBlock();
        } catch (error) {
            console.error(error);
        }
    };

    const handleBlock = () => {
        if (props.payload?.peer) {
            blockContact(props.payload?.peer.did_id);
            SheetManager.hide("report-sheet");
            router.dismissAll();
        }
    };

    return (
        <ActionSheet id={props.sheetId}>
            <View style={styles.container}>
                <ThemedText darkColor="black" type="title">
                    Safety center
                </ThemedText>

                {mode === ModalMode.DEFAULT && (
                    <>
                        <ThemedText darkColor="black" type="default">
                            You seem to need help with this conversation. Here
                            are some options to help you.
                        </ThemedText>

                        <View style={styles.buttonContainer}>
                            <Button2 title="Block" onPress={handleBlock} />
                            <Button2
                                title="Report"
                                onPress={() => setMode(ModalMode.REPORT_REASON)}
                            />
                        </View>
                        <View style={styles.navigationButtonContainer}>
                            <RNButton title="Cancel" onPress={handleCancel} />
                        </View>
                    </>
                )}

                {mode === ModalMode.REPORT_REASON && (
                    <>
                        <ThemedText darkColor="black" type="default">
                            Please select a reason for reporting this
                            conversation.
                        </ThemedText>

                        <View style={styles.buttonContainer}>
                            <Button2
                                title="Spam"
                                onPress={() => handleReportReason("spam")}
                            />
                            <Button2
                                title="Nudity"
                                onPress={() => handleReportReason("nudity")}
                            />
                            <Button2
                                title="Hate speech"
                                onPress={() =>
                                    handleReportReason("hate-speech")
                                }
                            />
                            <Button2
                                title="Child abuse"
                                onPress={() =>
                                    handleReportReason("child-abuse")
                                }
                            />
                            <Button2
                                title="Other"
                                onPress={() => handleReportReason("other")}
                            />
                        </View>
                        <View style={styles.navigationButtonContainer}>
                            <RNButton
                                title="Back"
                                onPress={() => setMode(ModalMode.DEFAULT)}
                            />
                            <RNButton title="Cancel" onPress={handleCancel} />
                        </View>
                    </>
                )}

                {mode === ModalMode.REPORT_DETAILS && (
                    <>
                        <ThemedText darkColor="black" type="default">
                            Please provide more details about the report.
                        </ThemedText>
                        <TextInput
                            value={inputValue}
                            onChangeText={setInputValue}
                            multiline={true}
                            numberOfLines={10}
                            placeholderTextColor={Colors.textGray}
                            placeholder="Enter more details..."
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 16,
                            }}
                        />
                        <View style={styles.row}>
                            <ThemedText style={{ color: Colors.light.text }}>
                                Join messages and media in report
                            </ThemedText>
                            <Switch
                                value={joinMessages}
                                onValueChange={(value) =>
                                    setJoinMessages(value)
                                }
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <Button2
                                title="Send report & block user"
                                onPress={() => sendReportAndBlock()}
                            />
                        </View>

                        <View style={styles.navigationButtonContainer}>
                            <RNButton
                                title="Back"
                                onPress={() => setMode(ModalMode.REPORT_REASON)}
                            />
                            <RNButton title="Cancel" onPress={handleCancel} />
                        </View>
                    </>
                )}
            </View>
        </ActionSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    message: {
        fontSize: 16,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 16,
    },
    navigationButtonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 16,
    },
    button: {
        minWidth: 100,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        justifyContent: "space-between",
    },
});

export default ReportSheet;
