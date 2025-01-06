import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

import { Href, Link } from "expo-router";

import { Box } from "@/src/components/design-system/Box.jsx";
import { ChatListFilters } from "@/src/components/fragments/ChatList/ChatListFilters.jsx";
import ChatItem from "@/src/components/fragments/ChatList/ChatItem.jsx";
import ChatListHeader from "@/src/components/fragments/ChatList/ChatListHeader.jsx";
import { useGlobalState } from "@/src/context/GlobalContext.jsx";
import { getShownChats } from "@/src/context/ChatListContext";
import { useLiveTablesQuery } from "@/src/hooks/useLiveQuery";
import { SCREEN_HEIGHT } from "@/src/components/fragments/Camera/Constants";
import { chatListView } from "@/src/db/queries/ChatListView";
import { ChatListView } from "@/src/types/";

export function ChatList() {
    const { chatList } = useGlobalState();

    const [shownChats, setShownChats] = useState<ChatListView[]>([]);
    const [dbData, setDbData] = useState<ChatListView[]>([]);

    const { data: chat_list_data } = useLiveTablesQuery(
        chatListView,
        ["messages", "contacts", "trust_relations"],
        [chatList.selectedFilters]
    );

    useEffect(() => {
        setDbData(
            chat_list_data.map((d) => ({
                ...d,
                most_recent_message: d.most_recent_message ?? "",
                most_recent_message_type: d.most_recent_message_type ?? "empty",
                most_recent_message_date: d.most_recent_message_date
                    ? d.most_recent_message_date * 1000
                    : d.created_at.getTime(),
                trusted_name: d.trusted_name ?? undefined,
            }))
        );
    }, [chat_list_data]);

    useEffect(() => {
        setShownChats(getShownChats(dbData, chatList.selectedFilters));
    }, [dbData, chatList.selectedFilters]);

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
                            <ChatItem {...d} />
                        </TouchableOpacity>
                    </Link>
                ))}
                <Box marginHorizontal={128} height={150} />
            </ScrollView>
        </Box>
    );
}
