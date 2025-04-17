import React, { useRef } from "react";
import {
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Box } from "@/src/ui/design-system/layout";
import { Text } from "@/src/ui/design-system/Text";
import { Colors } from "@/src/constants/Colors";
import { formatDuration } from "@/src/utils/TimeUtils";

interface MessageInputProps {
    newMessage: string;
    setNewMessage: (message: string) => void;
    onSendMessage: () => void;
    onSendMedia: () => void;
    onCollapse: () => void;
    isRecording: boolean;
    recordingDuration: number;
    onStartRecording: () => void;
    onStopRecording: () => void;
    shouldShowSendIcon: boolean;
    footerHeight: number;
    insets: {
        bottom: number;
    };
}

export const MessageInput: React.FC<MessageInputProps> = ({
    newMessage,
    setNewMessage,
    onSendMessage,
    onSendMedia,
    onCollapse,
    isRecording,
    recordingDuration,
    onStartRecording,
    onStopRecording,
    shouldShowSendIcon,
    footerHeight,
    insets,
}) => {
    const inputFieldRef = useRef<TextInput>(null);

    return (
        <Pressable onPress={() => inputFieldRef.current?.focus()}>
            <Box
                testID="message-input-container"
                backgroundColor={Colors.background}
                h={footerHeight + insets.bottom + 900}
                bottom={-insets.bottom + 30}
                width={"102%"}
                marginBottom={-900}
                left={"-1%"}
                position="relative"
                borderColor={Colors.darkGray}
                borderBottomWidth={0}
                borderWidth={3}
                borderRadius={20}
            >
                <TextInput
                    ref={inputFieldRef}
                    placeholder="Share something..."
                    returnKeyType="send"
                    placeholderTextColor={Colors.textGray}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    onSubmitEditing={onSendMessage}
                    style={styles.messageInput}
                    onFocus={() => onCollapse()}
                />

                <TouchableOpacity
                    testID="attachment-button"
                    style={styles.attachmentButton}
                    onPress={onSendMedia}
                >
                    <MaterialCommunityIcons
                        name="paperclip"
                        size={24}
                        color={Colors.textWhite}
                    />
                </TouchableOpacity>

                {shouldShowSendIcon ? (
                    <TouchableOpacity
                        testID="send-button"
                        style={styles.sendButton}
                        onPress={onSendMessage}
                    >
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            color={Colors.textWhite}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.recordingContainer}>
                        {isRecording && (
                            <View style={styles.recordingDurationContainer}>
                                <Text color={Colors.textWhite} fontSize={12}>
                                    {formatDuration(recordingDuration)}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity
                            testID="microphone-button"
                            onPressIn={onStartRecording}
                            onPressOut={onStopRecording}
                            style={styles.microphoneButton}
                        >
                            <MaterialCommunityIcons
                                name="microphone"
                                size={24}
                                color={Colors.textWhite}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </Box>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    messageInput: {
        color: "white",
        padding: 12,
        marginRight: 60,
        marginLeft: 60,
        marginTop: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.darkGray,
    },
    attachmentButton: {
        position: "absolute",
        padding: 14,
    },
    sendButton: {
        position: "absolute",
        right: 0,
        padding: 14,
    },
    recordingContainer: {
        position: "absolute",
        right: 0,
        top: 0,
    },
    recordingDurationContainer: {
        position: "absolute",
        top: -40,
        right: 12,
        backgroundColor: Colors.darkGray,
        padding: 8,
        borderRadius: 12,
        minWidth: 60,
        alignItems: "center",
    },
    microphoneButton: {
        padding: 14,
    },
});
