import React from "react";
import { Pressable } from "react-native";
import { Box } from "@/src/components/design-system/Box.jsx";
import { Badge } from "@/src/components/design-system/Badge.jsx";
import { BadgeText } from "@/src/components/design-system/BadgeText.jsx";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext.jsx";
import { NEIGHBOURHOOD_FILTERS } from "@/data/neighbourhood.js";

export const COMMON_FILTERS = ["unread", "smashed", "trusted"];

export function ChatListFilters() {
    const { chatList } = useGlobalState();
    const dispatch = useGlobalDispatch();

    const filters = [...COMMON_FILTERS, ...NEIGHBOURHOOD_FILTERS];

    return (
        <Box flexDirection="row" marginBottom={10} paddingHorizontal={10}>
            {[
                ...chatList.selectedFilters,
                ...filters.filter((f) => !chatList.selectedFilters.includes(f)),
            ].map((filter) => {
                const selected = chatList.selectedFilters.includes(filter);
                return (
                    <Pressable
                        key={filter}
                        onPress={() =>
                            dispatch({
                                type: "CHAT_LIST_TOGGLE_FILTER_ACTION",
                                filter,
                            })
                        }
                    >
                        <Badge
                            type={selected ? "smashed" : "unselected"}
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
            })}
        </Box>
    );
}
