import React, { useEffect, useState } from "react";
import { FlatList, Pressable } from "react-native";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Box } from "@/src/ui/design-system/layout";
import { Badge, BadgeText } from "@/src/ui/design-system/Badge";
import {
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext.jsx";
import { NEIGHBOURHOOD_FILTERS } from "@/data/neighbourhood.js";
import { countUniqueEmojisInNotes } from "@/src/utils/NotesUtils";
import { getAllContactNotesQuery } from "@/src/db/models/Contacts";

export const COMMON_FILTERS = ["unread", "smashed", "trusted"];

const FilterItem = ({
    filter,
    selectedFilters,
}: {
    filter: string;
    selectedFilters: string[];
}) => {
    const dispatch = useGlobalDispatch();

    return (
        <Pressable
            onPress={() =>
                dispatch({
                    type: "CHAT_LIST_TOGGLE_FILTER_ACTION",
                    filter,
                })
            }
        >
            <Badge
                type={
                    selectedFilters.includes(filter) ? "selected" : "unselected"
                }
                size="lg"
                marginRight={6}
            >
                {filter !== "trusted" && (
                    <BadgeText color="white">{filter}</BadgeText>
                )}
                {filter === "trusted" && (
                    <MaterialCommunityIcons
                        name="check-circle"
                        size={14}
                        color="white"
                    />
                )}
            </Badge>
        </Pressable>
    );
};

export function ChatListFilters() {
    const {
        chatList: { selectedFilters },
    } = useGlobalState();

    const [filters, setFilters] = useState<string[]>(
        Array.from(new Set([...COMMON_FILTERS, ...NEIGHBOURHOOD_FILTERS]))
    );

    const { data: notes } = useLiveQuery(getAllContactNotesQuery, []);

    useEffect(() => {
        if (!notes) return;
        
        const emojis = countUniqueEmojisInNotes(notes);
        const newFilters = [
            ...COMMON_FILTERS,
            ...NEIGHBOURHOOD_FILTERS,
            ...emojis.map((e) => e.emoji),
        ];
        const newFiltersSet = Array.from(new Set(newFilters));
        
        // Only update if the filters have actually changed
        if (JSON.stringify(newFiltersSet) !== JSON.stringify(filters)) {
            setFilters(newFiltersSet);
        }
    }, [notes, filters]);

    return (
        <Box marginBottom={10} paddingHorizontal={10}>
            <FlatList
                horizontal
                data={[
                    ...selectedFilters,
                    ...Array.from(
                        new Set(
                            filters.filter((f) => !selectedFilters.includes(f))
                        )
                    ),
                ]}
                renderItem={({ item: filter }) => {
                    return (
                        <FilterItem
                            filter={filter}
                            selectedFilters={selectedFilters}
                        />
                    );
                }}
                keyExtractor={(filter) => filter}
                showsHorizontalScrollIndicator={false}
            />
        </Box>
    );
}
