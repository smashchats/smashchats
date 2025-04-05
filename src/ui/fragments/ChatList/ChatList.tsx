import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, TouchableOpacity } from "react-native";
import { Href, Link } from "expo-router";

import { Box } from "@/src/ui/design-system/layout";
import { ChatItem } from "@/src/ui/fragments/ChatList/ChatItem";
import { ChatListFilters } from "@/src/ui/fragments/ChatList/ChatListFilters";
import { ChatListHeader } from "@/src/ui/fragments/ChatList/ChatListHeader";
import { useGlobalState } from "@/src/context/GlobalContext.jsx";
import { getShownChats } from "@/src/context/ChatListContext";
import { SCREEN_HEIGHT } from "@/src/ui/constants";
import { ChatListView } from "@/src/types/ChatListScreen.types";
import { deleteAllMessagesInDiscussion } from "@/src/db/models/Messages";
import { deleteContact } from "@/src/db/models/Contacts";
import { dev_nab_join_action } from "@/data/dev";

interface Props {
    chats: ChatListView[];
}

export function ChatList({ chats }: Readonly<Props>) {
    const {
        chatList: { selectedFilters, drafts },
    } = useGlobalState();

    const [shownChats, setShownChats] = useState<ChatListView[]>(chats);

    const [selectedChats, setSelectedChats] = useState<ChatListView[]>([]);

    useEffect(() => {
        setShownChats(getShownChats(chats, selectedFilters));
    }, [chats, selectedFilters]);

    const handleChatLongPress = (chat: ChatListView) => {
        if (selectedChats.length === 0) {
            setSelectedChats([chat]);
        }
    };

    const handleDeleteChats = async () => {
        await Promise.all(
            selectedChats.map(async (chat) => {
                await deleteAllMessagesInDiscussion(chat.did_id);
                await deleteContact(chat.did_id);
            })
        );
        setSelectedChats([]);
    };

    const [refreshing, setRefreshing] = useState(false);
    const { selfSmashUser } = useGlobalState();

    const handleRefresh = async () => {
        setRefreshing(true);
        await selfSmashUser.join(dev_nab_join_action);
        await selfSmashUser.discover();
        setRefreshing(false);
    };

    return (
        <Box height={SCREEN_HEIGHT}>
            <ChatListHeader
                selectionEnabled={selectedChats.length > 0}
                selectedChats={selectedChats}
                onDone={() => {
                    setSelectedChats([]);
                }}
                onDelete={handleDeleteChats}
            />
            <ChatListFilters />
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ justifyContent: "flex-start" }}
                style={{ paddingTop: 10 }}
            >
                <Box marginHorizontal={128}>
                    {/* 10 v 128 based on idk what */}
                    <Box width="100%" />
                </Box>
                {shownChats.map((d) => (
                    <Link
                        key={d.did_id}
                        href={
                            `/profile/${encodeURIComponent(
                                d.did_id
                            )}/messages?${new URLSearchParams({
                                active: d.active?.toString() ?? "false",
                            })}` as Href
                        }
                        asChild
                    >
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={(e) => {
                                if (selectedChats.length > 0) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (selectedChats.includes(d)) {
                                        setSelectedChats(
                                            selectedChats.filter((c) => c !== d)
                                        );
                                    } else {
                                        setSelectedChats([...selectedChats, d]);
                                    }
                                }
                            }}
                            onLongPress={() => handleChatLongPress(d)}
                        >
                            <ChatItem
                                {...d}
                                draft={drafts?.[d.did_id]}
                                selected={selectedChats.includes(d)}
                                selectionEnabled={selectedChats.length > 0}
                            />
                        </TouchableOpacity>
                    </Link>
                ))}
                <Box marginHorizontal={128} height={150} />
            </ScrollView>
        </Box>
    );
}
