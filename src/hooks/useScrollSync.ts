import { FlatListProps } from "react-native";
import { HeaderConfig, ScrollPair } from "@/src/app/profile/[user]/(tabs)/_layout";
import Animated from "react-native-reanimated";

const useScrollSync = (
    scrollPairs: ScrollPair[],
    headerConfig: HeaderConfig
) => {
    const sync: NonNullable<FlatListProps<any>["onMomentumScrollEnd"]> = (
        event
    ) => {
        const { y } = event.nativeEvent.contentOffset;

        const { heightCollapsed, heightExpanded } = headerConfig;

        const headerDiff = heightExpanded - heightCollapsed;

        for (const { list, position } of scrollPairs) {
            const scrollPosition = position.value ?? 0;

            if (scrollPosition > headerDiff && y > headerDiff) {
                continue;
            }

            if (list.current) {
                if (list.current.hasOwnProperty("scrollTo")) {
                    (list.current as Animated.ScrollView).scrollTo({
                        y: Math.min(y, headerDiff),
                        animated: false,
                    });
                } else {
                    (list.current as Animated.FlatList<any>).scrollToOffset({
                        offset: Math.min(y, headerDiff),
                        animated: false,
                    });
                }
            }
        };

    }
    return { sync };
}

export default useScrollSync;
