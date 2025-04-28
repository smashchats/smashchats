import React, { type PropsWithChildren, useEffect } from "react";
import { StyleSheet } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
} from "react-native-reanimated";

import { IM_CHAT_TEXT, IM_MEDIA_EMBEDDED } from "@smashchats/library";

import { Colors } from "@/src/constants/Colors.js";
import { Box, HStack, VStack } from "@/src/ui/design-system/layout";
import { Avatar } from "@/src/ui/components/Avatar";
import { SerifHeading } from "@/src/ui/design-system/SerifHeading";
import { Heading } from "@/src/ui/design-system/Heading";
import { Badge, BadgeText } from "@/src/ui/design-system/Badge";
import { dateToShowableString } from "@/src/utils/TimeUtils";
import { ChatListView } from "@/src/types/";
import { Checkbox } from "@/src/ui/design-system/Checkbox/Checkbox";

type ChatItemProps = PropsWithChildren<ChatListView>;

// SUPPORT FOR NEW MESSAGE TYPES SHOULD BE ADDED HERE
export function getExcerpt(
    rawMessage: string,
    messageType: string,
    draft?: string
): string {
    if (draft) {
        return `Draft: ${draft}`;
    }

    if (messageType === IM_CHAT_TEXT) {
        return rawMessage.split(" ").slice(0, 10).join(" ");
    } else if (messageType === "empty") {
        return "(new contact)";
    } else if (messageType === IM_MEDIA_EMBEDDED) {
        return "Sent media";
    }
    return "unsupported message";
}

export function ChatItem({
    did_id,
    meta_title,
    unread_count,
    trusted_name,
    most_recent_message,
    most_recent_message_type,
    most_recent_message_date,
    active,
    meta_avatar,
    draft,
    selected,
    selectionEnabled,
}: ChatItemProps): React.JSX.Element {
    const date = dateToShowableString(new Date(most_recent_message_date));

    const VERTICAL_PADDING = 8;
    const CHAT_ITEM_HEIGHT = 70;
    const TEXT_CONTAINER_HEIGHT = 40;
    const NAME_HEIGHT = 22;
    const MESSAGE_HEIGHT = 18;
    const DATE_BADGE_WIDTH = 70;

    const text =
        getExcerpt(most_recent_message, most_recent_message_type, draft) ??
        "(new contact)";

    const checkboxAnimation = useSharedValue(0);
    const contentAnimation = useSharedValue(0);

    useEffect(() => {
        if (selectionEnabled) {
            checkboxAnimation.value = withTiming(1, { duration: 300 });
            contentAnimation.value = withTiming(1, { duration: 300 });
        } else {
            checkboxAnimation.value = withTiming(0, { duration: 300 });
            contentAnimation.value = withTiming(0, { duration: 300 });
        }
    }, [selectionEnabled, checkboxAnimation, contentAnimation]);

    const checkboxStyle = useAnimatedStyle(() => {
        return {
            opacity: checkboxAnimation.value,
            transform: [
                {
                    translateX: interpolate(
                        checkboxAnimation.value,
                        [0, 1],
                        [-12, 0]
                    ),
                },
            ],
        };
    });

    const dynamicContentStyle = useAnimatedStyle(() => {
        return {
            flex: 1,
            marginRight: DATE_BADGE_WIDTH,
            transform: [
                {
                    translateX: interpolate(
                        contentAnimation.value,
                        [0, 1],
                        [0, 12]
                    ),
                },
            ],
        };
    });

    const displayName =
        trusted_name ??
        meta_title ??
        `unnamed contact (${did_id.substring(did_id.length - 4)})`;

    return (
        <Box
            flex={1}
            paddingHorizontal={10}
            marginTop={VERTICAL_PADDING}
            height={CHAT_ITEM_HEIGHT}
        >
            <HStack
                alignItems="center"
                height={CHAT_ITEM_HEIGHT - VERTICAL_PADDING * 2 - 1} // Subtract padding and divider
            >
                {selectionEnabled && (
                    <Animated.View style={checkboxStyle}>
                        <Checkbox checked={selected ?? false} />
                    </Animated.View>
                )}

                <Animated.View style={dynamicContentStyle}>
                    <HStack
                        gap={12}
                        alignItems="center"
                        alignContent="flex-start"
                        flex={1}
                    >
                        <Avatar
                            contact={{
                                meta_title,
                                meta_avatar,
                                trusted_name,
                            }}
                            variant={"medium"}
                        />
                        <Box style={styles.contentContainer}>
                            <VStack
                                flex={1}
                                gap={4}
                                marginBottom={12}
                                height={TEXT_CONTAINER_HEIGHT}
                                justifyContent="center"
                            >
                                <HStack
                                    alignItems="center"
                                    height={NAME_HEIGHT}
                                >
                                    <Box style={styles.nameContainer}>
                                        <SerifHeading color="white">
                                            {displayName}
                                        </SerifHeading>
                                    </Box>
                                    {trusted_name !== undefined && (
                                        <Box style={styles.badgeContainer}>
                                            <MaterialCommunityIcons
                                                name="check-circle"
                                                size={14}
                                                color="white"
                                            />
                                        </Box>
                                    )}
                                </HStack>
                                <Heading
                                    fontStyle={draft ? "italic" : "normal"}
                                    fontWeight={"400"}
                                    color={
                                        draft ? Colors.textLightGray : "white"
                                    }
                                    fontSize={12}
                                    isTruncated={true}
                                    h={MESSAGE_HEIGHT}
                                >
                                    {text}
                                </Heading>
                            </VStack>
                        </Box>
                    </HStack>
                </Animated.View>

                <Box
                    style={styles.dateContainer}
                    height={TEXT_CONTAINER_HEIGHT}
                    width={DATE_BADGE_WIDTH}
                >
                    <VStack
                        alignItems="flex-end"
                        gap={12}
                        height={TEXT_CONTAINER_HEIGHT}
                        justifyContent="center"
                    >
                        <Heading
                            color={Colors.textWhite}
                            fontFamily='Cairo, apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                            fontWeight="100"
                            fontSize={12}
                            marginBottom={-2}
                            isTruncated={true}
                            h={16}
                        >
                            {date}
                        </Heading>

                        {unread_count > 0 ? (
                            <Badge type={active ? "selected" : "disabled"}>
                                <BadgeText
                                    fontWeight="100"
                                    color={Colors.textWhite}
                                >
                                    {unread_count}
                                </BadgeText>
                            </Badge>
                        ) : (
                            <Box height={20} />
                        )}
                    </VStack>
                </Box>
            </HStack>
            <Box
                height={1}
                backgroundColor={Colors.darkerGray}
                marginTop={VERTICAL_PADDING + 10}
                marginRight={-10}
            />
        </Box>
    );
}

const styles = StyleSheet.create({
    dateContainer: {
        position: "absolute",
        right: 0,
        zIndex: 10,
    },
    contentContainer: {
        flex: 1,
        width: "100%",
        paddingRight: 16,
    },
    nameContainer: {
        flexDirection: "row",
        flexShrink: 1,
        marginRight: 4,
    },
    badgeContainer: {
        flexShrink: 0,
        alignSelf: "flex-start",
    },
});

export default ChatItem;
