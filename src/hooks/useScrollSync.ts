import { FlatList, FlatListProps, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import Animated, { AnimatedRef, SharedValue, withTiming } from "react-native-reanimated";

import { DisplayableMessage } from "@/src/types/DiscussionScreen.types";

export const SCROLL_ANIMATION_DURATION = 250;

export type HeaderConfig = {
    heightExpanded: number;
    heightCollapsed: number;
};

export type ScrollConfig = {
    scrollableRef:
    | AnimatedRef<FlatList<DisplayableMessage>>
    | AnimatedRef<Animated.ScrollView>;
    position: SharedValue<number>;
    virtual?: boolean;
};

export enum Visibility {
    Hidden = 0,
    Visible = 1,
}

export const scrollTo = (y: number) =>
({
    nativeEvent: { contentOffset: { y } },
} as NativeSyntheticEvent<NativeScrollEvent>);


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

        for (const { scrollableRef, position, virtual } of scrollConfigs) {
            const scrollPosition = position.value ?? 0;

            if (virtual) {
                position.value = withTiming(y, {
                    duration: SCROLL_ANIMATION_DURATION,
                });
                continue;
            }

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
