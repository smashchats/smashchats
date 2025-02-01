import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Href, Link } from "expo-router";

import { Box } from "@/src/ui/design-system/layout";
import { ChatItem } from "@/src/ui/fragments/ChatList/ChatItem";
import { ChatListFilters } from "@/src/ui/fragments/ChatList/ChatListFilters";
import { ChatListHeader } from "@/src/ui/fragments/ChatList/ChatListHeader";
import { useGlobalState } from "@/src/context/GlobalContext.jsx";
import { getShownChats } from "@/src/context/ChatListContext";
import { SCREEN_HEIGHT } from "@/src/ui/constants";
import { ChatListView } from "@/src/types/ChatListScreen.types";

interface Props {
    chats: ChatListView[];
}

export function ChatList({ chats }: Readonly<Props>) {
    const {
        chatList: { selectedFilters, drafts },
    } = useGlobalState();

    const [shownChats, setShownChats] = useState<ChatListView[]>(chats);

    useEffect(() => {
        setShownChats(getShownChats(chats, selectedFilters));
    }, [chats, selectedFilters]);

    return (
        <Box height={SCREEN_HEIGHT}>
            <ChatListHeader />
            <ChatListFilters />
            <ScrollView
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
                            })}` as Href<string>
                        }
                        asChild
                    >
                        <TouchableOpacity activeOpacity={0.8}>
                            <ChatItem {...d} draft={drafts?.[d.did_id]} />
                        </TouchableOpacity>
                    </Link>
                ))}
                <Box marginHorizontal={128} height={150} />
            </ScrollView>
        </Box>
    );
}
