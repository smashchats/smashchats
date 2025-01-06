import { FlatListProps } from "react-native";
import { HeaderConfig, ScrollConfig } from "@/src/app/profile/[user]/(tabs)/_layout";
import Animated from "react-native-reanimated";

const useScrollSync = (
    scrollConfigs: ScrollConfig[],
    headerConfig: HeaderConfig
) => {
    const sync: NonNullable<FlatListProps<any>["onMomentumScrollEnd"]> = (
        event
    ) => {
        const { y } = event.nativeEvent.contentOffset;

        const { heightCollapsed, heightExpanded } = headerConfig;

        const headerDiff = heightExpanded - heightCollapsed;

        for (const { scrollableRef, position } of scrollConfigs) {
            const scrollPosition = position.value ?? 0;

            if (scrollPosition > headerDiff && y > headerDiff) {
                continue;
            }

            if (scrollableRef.current) {
                if (scrollableRef.current.hasOwnProperty("scrollTo")) {
                    (scrollableRef.current as Animated.ScrollView).scrollTo({
                        y: Math.min(y, headerDiff),
                        animated: false,
                    });
                } else {
                    (scrollableRef.current as Animated.FlatList<any>).scrollToOffset({
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
