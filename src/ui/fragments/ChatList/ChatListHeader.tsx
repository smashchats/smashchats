import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { SheetManager } from "react-native-actions-sheet";

import { DIDDocument } from "@smashchats/library";

import { NeonBadge } from "@/src/ui/components/NeonBadge";
import { Colors } from "@/src/constants/Colors.js";
import { Box, HStack } from "@/src/ui/design-system/layout";
import { NEIGHBOURHOOD_DOMAIN } from "@/data/neighbourhood.js";
import { useGlobalState } from "@/src/context/GlobalContext";
import { ChatListView } from "@/src/types/ChatListScreen.types";
import { Text } from "@/src/ui/design-system/Text";
import { saveContactToDb } from "@/src/db/models/Contacts";
import { MapDidToContactInsert } from "@/src/utils/mappers/contacts";

type ChatListHeaderProps = {
    selectionEnabled: boolean;
    selectedChats: ChatListView[];
    onDone: () => void;
    onDelete: () => void;
};

const DEV_SECRET_COUNT = __DEV__ ? 2 : 10;

export function ChatListHeader({
    selectionEnabled,
    selectedChats,
    onDone,
    onDelete,
}: Readonly<ChatListHeaderProps>): JSX.Element {
    const globalState = useGlobalState();
    const [count, setCount] = useState(0);
    const [qrCode, setQrCode] = useState<string | undefined>(undefined);
    const router = useRouter();

    const handlePress = () => {
        setCount((count + 1) % DEV_SECRET_COUNT);
    };
    useEffect(() => {
        if (count === DEV_SECRET_COUNT - 1) {
            router.push("/secret");
        }
    }, [count, globalState.selfDid, router]);

    const handleScan = async (did: DIDDocument) => {
        await saveContactToDb(MapDidToContactInsert(did));
        router.push(`/profile/${did.id}`);
    };

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

                    <HStack alignItems="center" gap={8}>
                        <Pressable
                            onPress={async () => {
                                const result = await SheetManager.show(
                                    "code-scanner-sheet"
                                );
                                if (result) {
                                    const did: DIDDocument = JSON.parse(result);
                                    await handleScan(did);
                                }
                            }}
                        >
                            <MaterialCommunityIcons
                                name="qrcode"
                                size={28}
                                color={"white"}
                                style={{
                                    transform: [
                                        { scaleX: 0.8 },
                                        { scaleY: 0.8 },
                                    ],
                                }}
                            />
                            <MaterialCommunityIcons
                                name="scan-helper"
                                size={28}
                                color={Colors.purple}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                }}
                            />
                        </Pressable>

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
                        top: 40,
                        zIndex: 1000,
                        left: 0,
                        position: "absolute",
                        backgroundColor: "red",
                    }}
                    onPress={() => setQrCode(undefined)}
                ></Pressable>
            )}
        </Box>
    );
}

export default ChatListHeader;
