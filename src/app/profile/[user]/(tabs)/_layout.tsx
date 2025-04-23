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
    clamp,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { Colors } from "@/src/constants/Colors.js";
import ProfileMessages from "@/src/app/profile/[user]/(tabs)/messages.jsx";
import { DisplayableMessage } from "@/src/types/";
import ProfilePictures from "@/src/app/profile/[user]/(tabs)/pictures.jsx";
import ProfileBadges from "@/src/app/profile/[user]/(tabs)/badges.jsx";
import {
    useGlobalDispatch,
    useGlobalState,
} from "@/src/context/GlobalContext.js";
import { getContactWithTrustRelation } from "@/src/db/models/Contacts";
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
    Scrollable,
    Visibility,
} from "@/src/hooks/useScrollSync";
import { useKeyboard } from "@/src/hooks/useKeyboard";
import { useCollapsibleHeaderTab } from "@/src/hooks/useCollapsibleHeaderTab";
import { TrustedContact } from "@/src/types/Contacts.types";
import { getAllVisualMediaInDiscussion } from "@/src/db/models/Media";

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
    const dispatch = useGlobalDispatch();
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
    const scrollToPosition = (position: number) => {
        const config = tabScrollConfigs[tabIndex];
        const scrollValue = config.virtual ? config.virtual : config.position;

        const syncScroll = () => sync(position);

        scrollValue.value = withTiming(position, {
            duration: SCROLL_ANIMATION_DURATION,
        });
        setTimeout(syncScroll, SCROLL_ANIMATION_DURATION);
    };

    const expand = () => {
        Keyboard.dismiss();
        scrollToPosition(0);
    };

    const collapse = () => {
        scrollToPosition(headerDiff);
    };
    //#endregion

    //#region [Tabs] scroll handlers
    //#region Messages scroll handler
    const messagesRealScrollValue = useSharedValue(0);
    const messagesVirtualScrollValue = useSharedValue(
        isActive ? headerDiff : 0
    );
    const messagesScrollHandler = useAnimatedScrollHandler((event) => {
        const {
            contentOffset: { y },
            contentSize: { height: contentHeight },
            layoutMeasurement: { height: layoutHeight },
        } = event;
        const scroll = contentHeight - layoutHeight - y;
        messagesRealScrollValue.value = scroll;

        if (scroll < headerDiff) {
            messagesVirtualScrollValue.value = scroll;
            // TODO: sync-ish --> determine if this is a good place to sync and what happens when we change tabs and back (what scroll should we find etc).
        } else if (messagesVirtualScrollValue.value < headerDiff) {
            runOnJS(collapse)();
        }

        if (scroll < heightExpanded && keyboardVisible) {
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
    const messagesHeight = useSharedValue(0);
    const tabScrollConfigs = useMemo<ScrollConfig[]>(
        () => [
            {
                scrollableRef:
                    messagesTabRef as unknown as AnimatedRef<Scrollable>,
                position: messagesRealScrollValue,
                height: messagesHeight,
                virtual: messagesVirtualScrollValue,
            },
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
            sync(isActive ? headerDiff : 0);
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
        const config = tabScrollConfigs[tabIndex];
        return (config.virtual ? config.virtual : config.position).value;
    }, [tabIndex, tabScrollConfigs]);

    const translateY = useDerivedValue(() =>
        clamp(сurrentScrollValue.value, 0, headerDiff)
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
        transform: [{ translateY: -translateY.value }],
    }));

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -translateY.value }],
        opacity: interpolate(
            -translateY.value,
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
            [0, headerDiff - OVERLAY_VISIBILITY_OFFSET, headerDiff],
            [Visibility.Hidden, Visibility.Visible, Visibility.Visible]
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

    const scrollValueOnInitPan = useSharedValue(0);

    //#region Renderers
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            const config = tabScrollConfigs[tabIndex];
            const scroll = config.virtual ? config.virtual : config.position;
            const newScrollValue = scrollValueOnInitPan.value - e.translationY;

            scroll.value = clamp(newScrollValue, 0, headerDiff);

            runOnJS(sync)(scroll.value);
        })
        .onStart(() => {
            runOnJS(hideKeyboard)();
            const config = tabScrollConfigs[tabIndex];
            const scroll = config.virtual ? config.virtual : config.position;
            scrollValueOnInitPan.value = scroll.value;
        });

    const renderTabBar = useCallback<
        (props: MaterialTopTabBarProps) => React.ReactElement
    >(
        (props) => (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={tabBarStyle}>
                    <ProfileTabBar onIndexChange={setTabIndex} {...props} />
                </Animated.View>
            </GestureDetector>
        ),
        [tabBarStyle, panGesture]
    );

    useEffect(() => {
        const fetchMedia = async () => {
            const media = await getAllVisualMediaInDiscussion(user as string);
            dispatch({
                type: "SET_SHOWN_MEDIA_IN_GALLERY_ACTION",
                media: media.map((m) => ({
                    uri: m.file_path,
                    type: m.media_type as "image" | "video",
                    id: m.sha256,
                })),
            });
        };
        fetchMedia();
    }, [user, dispatch]);

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
                onLayout={(event) =>
                    (messagesHeight.value = event.nativeEvent.layout.height)
                }
                contentContainerStyle={contentContainerStyle}
                scrollIndicatorInsets={scrollIndicatorInsets}
                onMomentumScrollEnd={() => sync(messagesRealScrollValue.value)}
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
                    tabPress: (e: any) => {
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

            {peer && (
                <ProfileHeader
                    headerHeight={HEADER_HEIGHT}
                    onExpand={expand}
                    peer={peer}
                />
            )}
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
        marginTop: -HEADER_HEIGHT,
        paddingTop: HEADER_HEIGHT,
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
