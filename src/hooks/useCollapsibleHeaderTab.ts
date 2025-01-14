import Animated, {
    AnimatedRef,
    ScrollHandlerProcessed,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useSharedValue
} from "react-native-reanimated";
import { ScrollConfig, Scrollable } from "./useScrollSync";

export const useCollapsibleHeaderTab = (): [
    ScrollConfig,
    ScrollHandlerProcessed
] => {
    const scrollValue = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollValue.value = event.contentOffset.y;
    });
    const tabRef = useAnimatedRef<Animated.ScrollView>();

    const scrollConfig: ScrollConfig = {
        scrollableRef: tabRef as AnimatedRef<Scrollable>,
        position: scrollValue,
    }

    return [
        scrollConfig,
        scrollHandler,
    ]
}