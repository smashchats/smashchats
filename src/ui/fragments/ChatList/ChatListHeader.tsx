import React, { useEffect, useState } from "react";
import { Pressable, Image } from "react-native";

import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { generateQrCode } from "react-native-qr";

import { NeonBadge } from "@/src/ui/components/NeonBadge";
import { Colors } from "@/src/constants/Colors.js";
import { Box, HStack } from "@/src/ui/design-system/layout";
import { NEIGHBOURHOOD_DOMAIN } from "@/data/neighbourhood.js";
import { useGlobalState } from "@/src/context/GlobalContext";
import { ChatListView } from "@/src/types/ChatListScreen.types";
import { Text } from "@/src/ui/design-system/Text";

type ChatListHeaderProps = {
    selectionEnabled: boolean;
    selectedChats: ChatListView[];
    onDone: () => void;
    onDelete: () => void;
};

export function ChatListHeader({
    selectionEnabled,
    selectedChats,
    onDone,
    onDelete,
}: Readonly<ChatListHeaderProps>): JSX.Element {
    const globalState = useGlobalState();
    const [count, setCount] = useState(0);
    const [qrCode, setQrCode] = useState<string | undefined>(undefined);

    const handlePress = () => {
        setCount((count + 1) % 10);
    };
    useEffect(() => {
        const logSelfDid = async () => {
            const selfDid = globalState.selfDid;

            generateQrCode(JSON.stringify(selfDid), 300).then(
                (img: string | undefined) => {
                    if (!img) {
                        return;
                    }
                    setQrCode(img);
                }
            );
        };
        if (count === 9) {
            logSelfDid();
        } else if (count === 0) {
            setQrCode(undefined);
        }
    }, [count, globalState.selfDid]);
    return (
        <Box>
            {selectionEnabled && (
                <HStack
                    marginHorizontal={10}
                    marginVertical={16}
                    justifyContent="space-between"
                >
                    <Pressable style={{ minHeight: 28 }} onPress={onDone}>
                        <Text fontWeight={500}>Done</Text>
                    </Pressable>
                    <Text fontWeight={"bold"}>
                        {selectedChats.length} selected
                    </Text>
                    <Pressable style={{ minHeight: 28 }} onPress={onDelete}>
                        <Text fontWeight={500} color="red">
                            Delete
                        </Text>
                    </Pressable>
                </HStack>
            )}
            {!selectionEnabled && (
                <HStack
                    marginHorizontal={10}
                    marginVertical={16}
                    justifyContent="space-between"
                >
                    <HStack alignItems="center">
                        <NeonBadge title={NEIGHBOURHOOD_DOMAIN} />
                        <Link href="https://smashchats.com" asChild>
                            <Feather
                                name="external-link"
                                size={18}
                                color={Colors.purple}
                                style={{ marginLeft: 10 }}
                            />
                        </Link>
                        <Pressable
                            onPress={handlePress}
                            style={{
                                width: 40,
                                height: 25,
                            }}
                        />
                    </HStack>

                    <HStack>
                        {/* <Feather name="plus" size={28} color={Colors.purple} /> */}
                        {/* <Feather name="search" size={28} color={Colors.purple} /> */}
                        <Link href="/settings" asChild>
                            <Pressable>
                                <Feather
                                    name="menu"
                                    size={28}
                                    color={Colors.purple}
                                />
                            </Pressable>
                        </Link>
                    </HStack>
                </HStack>
            )}
            {qrCode && (
                <Pressable
                    style={{
                        padding: 30,
                        top: 400,
                        left: 0,
                        position: "absolute",
                        backgroundColor: "red",
                    }}
                    onPress={() => setQrCode(undefined)}
                >
                    <Image
                        style={{
                            width: 300,
                            height: 300,
                            display: "flex",
                        }}
                        source={{ uri: qrCode }}
                    />
                </Pressable>
            )}
        </Box>
    );
}

export default ChatListHeader;
