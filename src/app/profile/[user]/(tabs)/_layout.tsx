import React, {
    MutableRefObject,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    ScrollView,
    StyleSheet,
    ViewStyle,
    StyleProp,
    ViewProps,
    useWindowDimensions,
    FlatListProps,
    KeyboardAvoidingView,
    Keyboard,
    FlatList,
} from "react-native";

import * as ScreenOrientation from "expo-screen-orientation";

import {
    MaterialTopTabBarProps,
    createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
    useAnimatedStyle,
    interpolate,
    useSharedValue,
    useAnimatedScrollHandler,
    useDerivedValue,
    useAnimatedRef,
    withTiming,
    runOnJS,
    AnimatedRef,
} from "react-native-reanimated";

import { Colors } from "@/src/constants/Colors.js";
import ProfileMessages from "@/src/app/profile/[user]/(tabs)/messages.jsx";
import { DisplayableMessage } from "@/src/types/";
import ProfilePictures from "@/src/app/profile/[user]/(tabs)/pictures.jsx";
import ProfileBadges from "@/src/app/profile/[user]/(tabs)/badges.jsx";
import { useGlobalState } from "@/src/context/GlobalContext.js";
import {
    TrustedContact,
    getContactWithTrustRelation,
} from "@/src/db/models/Contacts";
import {
    ProfileHeader,
    ProfileHeaderCollapsed,
    ProfileHeaderExpanded,
    ProfileTabBar,
} from "@/src/ui/fragments/ProfileTabs";
import useScrollSync, {
    HeaderConfig,
    SCROLL_ANIMATION_DURATION,
    ScrollConfig,
    scrollTo,
    Visibility,
} from "@/src/hooks/useScrollSync";
import { useKeyboard } from "@/src/hooks/useKeyboard";
import { useCollapsibleHeaderTab } from "@/src/hooks/useCollapsibleHeaderTab";

type ProfileIdType = {
    profileId: string;
    onRef: (ref: MutableRefObject<ScrollView>) => void;
};

type ProfileStackParamList = {
    messages: ProfileIdType;
    pictures: ProfileIdType;
    badges: ProfileIdType;
};

const Tab = createMaterialTopTabNavigator<ProfileStackParamList>();

const TAB_BAR_HEIGHT = 60;
const HEADER_HEIGHT = 60;

const OVERLAY_VISIBILITY_OFFSET = 90;

export const ProfileScreen = () => {
    const router = useRouter();
    const globalState = useGlobalState();
    const { keyboardVisible, hideKeyboard } = useKeyboard();
    const { user, active } = useLocalSearchParams();

    const [peer, setPeer] = useState<TrustedContact>();
    const isActive = active === "true";

    useEffect(() => {
        const fetchUser = async (did_id: string) => {
            try {
                const userData = await getContactWithTrustRelation(did_id);

                if (!userData) {
                    globalState.logger.warn(
                        `User ${user} not found in database`
                    );
                    router.back();
                    return;
                }

                setPeer(userData);
            } catch (error) {
                globalState.logger.error("Failed to fetch user:", error);
                router.back();
            }
        };

        fetchUser(user as string);
    }, [user, router]);

    useEffect(() => {
        ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        return () => {
            ScreenOrientation.unlockAsync();
        };
    }, []);

    //#region Collapsed header
    //#region Header
    const { top, bottom } = useSafeAreaInsets();

    const { height: screenHeight } = useWindowDimensions();
    const [tabIndex, setTabIndex] = useState(0);
    const [headerHeight, setHeaderHeight] = useState(0);

    const defaultHeaderHeight = HEADER_HEIGHT;

    const headerConfig = useMemo<HeaderConfig>(
        () => ({
            heightCollapsed: defaultHeaderHeight,
            heightExpanded: headerHeight,
        }),
        [defaultHeaderHeight, headerHeight]
    );

    const { heightCollapsed, heightExpanded } = headerConfig;

    const headerDiff = heightExpanded - heightCollapsed;

    const rendered = headerHeight > 0;

    const handleHeaderLayout = useCallback<NonNullable<ViewProps["onLayout"]>>(
        (event) => {
            setHeaderHeight(event.nativeEvent.layout.height);
        },
        []
    );
    //#endregion

    //#region Functions
    const expand = () => {
        const _expand = () => sync(scrollTo(0));

        Keyboard.dismiss();
        tabScrollConfigs[tabIndex].position.value = withTiming(0, {
            duration: SCROLL_ANIMATION_DURATION,
        });
        setTimeout(_expand, SCROLL_ANIMATION_DURATION);
    };

    const collapse = () => {
        const _collapse = () => sync(scrollTo(headerDiff));

        tabScrollConfigs[tabIndex].position.value = withTiming(headerDiff, {
            duration: SCROLL_ANIMATION_DURATION,
        });
        setTimeout(_collapse, SCROLL_ANIMATION_DURATION);
    };
    //#endregion

    //#region [Tabs] scroll handlers
    //#region Messages scroll handler
    const messagesRealScrollValue = useSharedValue(0);
    const messagesVirtualScrollValue = useSharedValue(0);
    const messagesScrollHandler = useAnimatedScrollHandler((event) => {
        const {
            contentOffset: { y },
            contentSize: { height: contentHeight },
            layoutMeasurement: { height: layoutHeight },
        } = event;
        const invertedScroll = contentHeight - layoutHeight - y;
        messagesRealScrollValue.value = invertedScroll;

        if (invertedScroll < headerDiff) {
            messagesVirtualScrollValue.value = invertedScroll;
            // TODO: sync-ish --> determine if this is a good place to sync and what happens when we change tabs and back (what scroll should we find etc).
        } else {
            runOnJS(collapse)();
        }

        if (invertedScroll < heightExpanded && keyboardVisible) {
            runOnJS(hideKeyboard)();
        }
    });
    const messagesTabRef = useAnimatedRef<FlatList<DisplayableMessage>>();
    //#endregion

    const [picturesScrollConfig, picturesScrollHandler] =
        useCollapsibleHeaderTab();
    const [badgesScrollConfig, badgesScrollHandler] = useCollapsibleHeaderTab();
    //#endregion

    //#region Scroll sync
    const tabScrollConfigs = useMemo<ScrollConfig[]>(
        () => [
            {
                scrollableRef: messagesTabRef,
                position: messagesVirtualScrollValue,
                virtual: true,
            } as unknown as ScrollConfig,
            picturesScrollConfig,
            badgesScrollConfig,
        ],
        [
            messagesTabRef,
            messagesVirtualScrollValue,
            picturesScrollConfig,
            badgesScrollConfig,
        ]
    );

    const { sync } = useScrollSync(tabScrollConfigs, headerConfig);

    useEffect(() => {
        if (!rendered) {
            return;
        }

        // TODO: what position if user is active? length of message list?
        const setInitialScrollPosition = () => {
            sync(scrollTo(isActive ? headerDiff : 0));
        };

        setInitialScrollPosition();
        setTimeout(setInitialScrollPosition, 100);
    }, [rendered, isActive, headerDiff]);

    const contentContainerStyle = useMemo<StyleProp<ViewStyle>>(
        () => ({
            paddingTop: rendered ? headerHeight + TAB_BAR_HEIGHT : 0,
            paddingBottom: bottom,
            minHeight: screenHeight + headerDiff,
        }),
        [rendered, headerHeight, bottom, screenHeight, headerDiff]
    );

    const sharedProps = useMemo<Partial<FlatListProps<DisplayableMessage>>>(
        () => ({
            contentContainerStyle,
            onMomentumScrollEnd: sync,
            onScrollEndDrag: sync,
            scrollEventThrottle: 16,
            scrollIndicatorInsets: {
                top: heightExpanded + TAB_BAR_HEIGHT - 3,
            },
        }),
        [contentContainerStyle, sync, heightExpanded]
    );

    const сurrentScrollValue = useDerivedValue(() => {
        return tabScrollConfigs[tabIndex].position.value;
    }, [tabIndex, tabScrollConfigs]);

    const translateY = useDerivedValue(
        () => -Math.min(сurrentScrollValue.value, headerDiff)
    );

    useEffect(() => {
        if (
            tabIndex === 0 &&
            rendered &&
            messagesRealScrollValue.value >= headerDiff
        ) {
            collapse();
        }
    }, [tabIndex]);

    const tabBarAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: interpolate(
            translateY.value,
            [-headerDiff, (-headerDiff * 2) / 5, 0],
            [Visibility.Hidden, Visibility.Visible, Visibility.Visible]
        ),
    }));

    const tabBarStyle = useMemo<StyleProp<ViewStyle>>(
        () => [
            rendered ? styles.tabBarContainer : undefined,
            { top: rendered ? headerHeight : undefined },
            tabBarAnimatedStyle,
        ],
        [rendered, headerHeight, tabBarAnimatedStyle]
    );

    const headerContainerStyle = useMemo<StyleProp<ViewStyle>>(
        () => [
            rendered ? styles.headerContainer : undefined,
            { paddingTop: top },
            headerAnimatedStyle,
        ],

        [rendered, top, headerAnimatedStyle]
    );

    const collapsedOverlayAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateY.value,
            [-headerDiff, OVERLAY_VISIBILITY_OFFSET - headerDiff, 0],
            [Visibility.Visible, Visibility.Hidden, Visibility.Hidden]
        ),
    }));

    const collapsedOverlayStyle = useMemo<StyleProp<ViewStyle>>(
        () => [
            styles.collapsedOverlay,
            collapsedOverlayAnimatedStyle,
            { height: heightCollapsed },
        ],
        [collapsedOverlayAnimatedStyle, heightCollapsed]
    );
    //#endregion

    //#region Renderers
    const renderTabBar = useCallback<
        (props: MaterialTopTabBarProps) => React.ReactElement
    >(
        (props) => (
            <Animated.View style={tabBarStyle}>
                <ProfileTabBar onIndexChange={setTabIndex} {...props} />
            </Animated.View>
        ),
        [tabBarStyle]
    );

    const renderMessages = useCallback(() => {
        const contentContainerStyle: StyleProp<ViewStyle> = {
            paddingTop:
                (sharedProps.contentContainerStyle as { paddingBottom: number })
                    .paddingBottom + 30,
            paddingBottom: (
                sharedProps.contentContainerStyle as { paddingTop: number }
            ).paddingTop,
            minHeight: screenHeight,
        };

        const scrollIndicatorInsets = {
            bottom: heightCollapsed + TAB_BAR_HEIGHT - 3,
        };

        if (!peer) {
            return null;
        }

        return (
            <ProfileMessages
                ref={messagesTabRef}
                onCollapse={collapse}
                onScroll={messagesScrollHandler}
                contentContainerStyle={contentContainerStyle}
                scrollIndicatorInsets={scrollIndicatorInsets}
                onMomentumScrollEnd={() =>
                    sync(scrollTo(messagesRealScrollValue.value))
                }
                peer={peer}
            />
        );
    }, [messagesTabRef, messagesScrollHandler, sharedProps]);

    const renderPictures = useCallback(
        () => (
            <ProfilePictures
                ref={
                    picturesScrollConfig.scrollableRef as AnimatedRef<Animated.ScrollView>
                }
                onScroll={picturesScrollHandler}
                {...sharedProps}
            />
        ),
        [picturesScrollConfig.scrollableRef, picturesScrollHandler, sharedProps]
    );

    const renderBadges = useCallback(
        () => (
            <ProfileBadges
                ref={
                    badgesScrollConfig.scrollableRef as AnimatedRef<Animated.ScrollView>
                }
                onScroll={badgesScrollHandler}
                {...sharedProps}
            />
        ),
        [badgesScrollConfig.scrollableRef, badgesScrollHandler, sharedProps]
    );

    //#endregion
    //#endregion

    if (!user) {
        router.back();
        return null;
    }

    return (
        <KeyboardAvoidingView
            style={{
                flex: 1,
                backgroundColor: Colors.background,
                marginTop: top,
            }}
            behavior="height"
            keyboardVerticalOffset={-bottom}
        >
            <Animated.View
                onLayout={handleHeaderLayout}
                style={headerContainerStyle}
            >
                <ProfileHeaderExpanded peer={peer} />
            </Animated.View>
            <Animated.View style={collapsedOverlayStyle}>
                <ProfileHeaderCollapsed peer={peer} />
            </Animated.View>

            <Tab.Navigator
                tabBar={renderTabBar}
                screenListeners={{
                    tabPress: (e) => {
                        if (Keyboard.isVisible()) {
                            e.preventDefault();
                            Keyboard.dismiss();
                        }
                    },
                }}
            >
                <Tab.Screen options={{ title: "Chats" }} name="messages">
                    {renderMessages}
                </Tab.Screen>
                <Tab.Screen options={{ title: "Pictures" }} name="pictures">
                    {renderPictures}
                </Tab.Screen>
                <Tab.Screen options={{ title: "Badges" }} name="badges">
                    {renderBadges}
                </Tab.Screen>
            </Tab.Navigator>

            <ProfileHeader headerHeight={HEADER_HEIGHT} onExpand={expand} />
        </KeyboardAvoidingView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    tabBarContainer: {
        top: 0,
        left: 0,
        right: 0,
        position: "absolute",
        backgroundColor: Colors.background,
        zIndex: 150,
    },
    headerContainer: {
        top: 0,
        left: 0,
        right: 0,
        position: "absolute",
        backgroundColor: Colors.background,
        zIndex: 1,
    },
    collapsedOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background,
        justifyContent: "center",
        zIndex: 2,
    },
});
