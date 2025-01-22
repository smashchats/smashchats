import {
    NativeScrollEvent,
    NativeSyntheticEvent,
} from "react-native";
import Animated, {
    AnimatedRef,
    SharedValue,
} from "react-native-reanimated";

export const SCROLL_ANIMATION_DURATION = 250;

export type HeaderConfig = {
    heightExpanded: number;
    heightCollapsed: number;
};

export type ScrollConfig = {
    scrollableRef: AnimatedRef<Scrollable>;
    position: SharedValue<number>;
    virtual?: SharedValue<number>;
    height?: SharedValue<number>;
};

export enum Visibility {
    Hidden = 0,
    Visible = 1,
}

export type Scrollable = Animated.ScrollView | Animated.FlatList<any>;

export const delta = (a: number, b: number) => Math.abs(a - b);

const useScrollSync = (
    scrollConfigs: ScrollConfig[],
    headerConfig: HeaderConfig
) => {
    const sync: (event: NativeSyntheticEvent<NativeScrollEvent> | number) => void = (
        event: NativeSyntheticEvent<NativeScrollEvent> | number
    ) => {
        const y = typeof event === 'number' ? event : event.nativeEvent.contentOffset.y;

        const { heightCollapsed, heightExpanded } = headerConfig;

        const headerDiff = heightExpanded - heightCollapsed;

        for (const { scrollableRef, position, virtual } of scrollConfigs) {
            const scrollPosition = virtual !== undefined ? virtual.value : position.value;

            if (virtual) {
                virtual.value = y
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
                } else if (scrollableRef.current.hasOwnProperty("scrollToOffset")) {
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
