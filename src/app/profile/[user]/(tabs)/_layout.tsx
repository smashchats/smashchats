import React, {
    MutableRefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ScrollView,
    Pressable,
    TextInput,
    StyleSheet,
    ViewStyle,
    StyleProp,
    ViewProps,
    useWindowDimensions,
    FlatListProps,
    KeyboardAvoidingView,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Keyboard,
    FlatList,
} from "react-native";

import * as ScreenOrientation from "expo-screen-orientation";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
    SharedValue,
    useDerivedValue,
    useAnimatedRef,
    AnimatedRef,
} from "react-native-reanimated";

import { DIDString } from "@smashchats/library";

import { Colors } from "@/src/constants/Colors.js";
import { Box } from "@/src/components/design-system/Box";
import ProfileMessages from "@/src/app/profile/[user]/(tabs)/messages.jsx";
import { DisplayableMessage, EnrichedSmashMessage } from "@/src/types/";
import ProfilePictures from "@/src/app/profile/[user]/(tabs)/pictures.jsx";
import ProfileBadges from "@/src/app/profile/[user]/(tabs)/badges.jsx";
import { useGlobalState } from "@/src/context/GlobalContext.js";
import {
    TrustedContact,
    getContactWithTrustRelation,
} from "@/src/db/models/Contacts";
import { saveMessageToDb } from "@/src/db/models/Messages";
import { ProfileTabBar } from "@/src/components/fragments/ProfileTabs/ProfileTabBar";
import { ProfileHeader } from "@/src/components/fragments/ProfileTabs/ProfileHeader";
import { MapContactToDid } from "@/src/utils/mappers/contacts";
import useScrollSync from "@/src/hooks/useScrollSync";
import { ProfileHeaderCollapsed } from "@/src/components/fragments/ProfileTabs/ProfileHeaderCollapsed";
import { ProfileHeaderExpanded } from "@/src/components/fragments/ProfileTabs/ProfileHeaderExpanded";

type ProfileIdType = {
    profileId: string;
    onRef: (ref: MutableRefObject<ScrollView>) => void;
};

type ProfileStackParamList = {
    messages: ProfileIdType;
    pictures: ProfileIdType;
    badges: ProfileIdType;
};

export type HeaderConfig = {
    heightExpanded: number;
    heightCollapsed: number;
};

export type ScrollConfig = {
    scrollableRef:
        | AnimatedRef<FlatList<DisplayableMessage>>
        | AnimatedRef<Animated.ScrollView>;
    position: SharedValue<number>;
};

export enum Visibility {
    Hidden = 0,
    Visible = 1,
}

const Tab = createMaterialTopTabNavigator<ProfileStackParamList>();

const TAB_BAR_HEIGHT = 60;
const HEADER_HEIGHT = 60;

const OVERLAY_VISIBILITY_OFFSET = 32;

const FEATURE_FLAGS = {
    show_pictures_and_badges: false,
    send_media: false,
    show_smash_or_pass: false,
};

export const ProfileScreen = () => {
    const { user } = useLocalSearchParams();
    const router = useRouter();
    const globalState = useGlobalState();
    const insets = useSafeAreaInsets();
    const footerHeight = 60;

    const [newMessage, setNewMessage] = useState("");
    const [shouldShowSendIcon, setShouldShowSendIcon] = useState(true);
    const [peer, setPeer] = useState<TrustedContact>();

    const inputFieldRef = useRef<TextInput>(null);

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

    useEffect(() => {
        setShouldShowSendIcon(newMessage.length > 0);
    }, [newMessage]);

    let peerId = `${user}`;

    const handleSendMessage = async () => {
        const dataToSend = newMessage.trim();
        if (dataToSend.length === 0) {
            return;
        }
        setNewMessage("");

        const lastMessageId =
            globalState.latestMessageIdInDiscussion[peerId] ?? "0";

        const data = await globalState.selfSmashUser.sendTextMessage(
            MapContactToDid(peer!),
            dataToSend,
            lastMessageId
        );
        const selfDid = globalState.selfDid;

        saveMessageToDb(
            {
                ...data,
                fromDid: selfDid.id,
                toDiscussionId: peerId as DIDString,
            } satisfies EnrichedSmashMessage,
            {
                date_read: new Date(),
            }
        );
    };

    const handleSendMedia = async () => {
        if (!FEATURE_FLAGS.send_media) {
            return;
        }

        let { canceled, assets } = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.2,
        });
        if (canceled) {
            return;
        }
        globalState.logger.info("assets", assets);
    };

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

    //#region [Tabs] scroll handlers
    //#region Messages scroll handler
    const messagesScrollValue = useSharedValue(0);
    const messagesScrollHandler = useAnimatedScrollHandler((event) => {
        messagesScrollValue.value = event.contentOffset.y;
    });
    const messagesTabRef = useAnimatedRef<FlatList<DisplayableMessage>>();
    //#endregion

    //#region Pictures scroll handler
    const picturesScrollValue = useSharedValue(0);
    const picturesScrollHandler = useAnimatedScrollHandler((event) => {
        picturesScrollValue.value = event.contentOffset.y;
    });
    const picturesTabRef = useAnimatedRef<Animated.ScrollView>();
    //#endregion

    //#region Badges scroll handler
    const badgesScrollValue = useSharedValue(0);
    const badgesScrollHandler = useAnimatedScrollHandler((event) => {
        badgesScrollValue.value = event.contentOffset.y;
    });
    const badgesTabRef = useAnimatedRef<Animated.ScrollView>();
    //#endregion
    //#endregion

    //#region Scroll sync
    const tabScrollConfigs = useMemo<ScrollConfig[]>(
        () => [
            {
                scrollableRef: messagesTabRef,
                position: messagesScrollValue,
            },
            {
                scrollableRef: picturesTabRef,
                position: picturesScrollValue,
            },
            {
                scrollableRef: badgesTabRef,
                position: badgesScrollValue,
            },
        ],
        [
            messagesTabRef,
            messagesScrollValue,
            picturesTabRef,
            picturesScrollValue,
            badgesTabRef,
            badgesScrollValue,
        ]
    );

    const { sync } = useScrollSync(tabScrollConfigs, headerConfig);

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

    const сurrentScrollValue = useDerivedValue(
        () => tabScrollConfigs[tabIndex].position.value,
        [tabIndex, tabScrollConfigs]
    );

    const translateY = useDerivedValue(
        () => -Math.min(сurrentScrollValue.value, headerDiff)
    );

    const tabBarAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: interpolate(
            translateY.value,
            [-headerDiff, 0],
            [Visibility.Hidden, Visibility.Visible]
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

    //#region Functions
    const expand = () => {
        Keyboard.dismiss();
        sync({
            nativeEvent: { contentOffset: { y: 0 } },
        } as NativeSyntheticEvent<NativeScrollEvent>);
    };

    const collapse = () => {
        sync({
            nativeEvent: { contentOffset: { y: headerDiff } },
        } as NativeSyntheticEvent<NativeScrollEvent>);
    };
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
            ...(sharedProps.contentContainerStyle as {}),
            paddingTop: (
                sharedProps.contentContainerStyle as { paddingBottom: number }
            ).paddingBottom,
        };

        const scrollIndicatorInsets = {
            bottom: heightCollapsed + TAB_BAR_HEIGHT - 3,
        };

        return (
            <Box flex={1} backgroundColor={Colors.background}>
                <ProfileMessages
                    ref={messagesTabRef}
                    onScroll={messagesScrollHandler}
                    {...sharedProps}
                    contentContainerStyle={contentContainerStyle}
                    scrollIndicatorInsets={scrollIndicatorInsets}
                />
                <Pressable onPress={() => inputFieldRef.current?.focus()}>
                    <Box
                        backgroundColor={Colors.background}
                        h={footerHeight + insets.bottom + 900}
                        bottom={-insets.bottom + 30}
                        width={"102%"}
                        marginBottom={-900}
                        left={"-1%"}
                        position="relative"
                        borderColor={Colors.darkGray}
                        borderBottomWidth={0}
                        borderWidth={3}
                        borderRadius={20}
                    >
                        <TextInput
                            ref={inputFieldRef}
                            placeholder="Share something..."
                            placeholderTextColor={Colors.textGray}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            style={{
                                color: "white",
                                padding: 15,
                                marginRight: 60,
                            }}
                            onFocus={collapse}
                        />

                        <Pressable
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                padding: 20,
                            }}
                            onPress={handleSendMessage}
                        >
                            <Feather
                                name="chevron-right"
                                size={24}
                                color={
                                    shouldShowSendIcon
                                        ? Colors.textWhite
                                        : Colors.darkGray
                                }
                            />
                        </Pressable>

                        {!shouldShowSendIcon && FEATURE_FLAGS.send_media && (
                            <Pressable
                                style={styles.floatingActionButton}
                                onPress={handleSendMedia}
                            >
                                <Feather
                                    name="paperclip"
                                    size={28}
                                    color="white"
                                />
                            </Pressable>
                        )}
                    </Box>
                </Pressable>
            </Box>
        );
    }, [messagesTabRef, messagesScrollHandler, sharedProps]);

    const renderPictures = useCallback(
        () => (
            <ProfilePictures
                ref={picturesTabRef}
                onScroll={picturesScrollHandler}
                {...sharedProps}
            />
        ),
        [picturesTabRef, picturesScrollHandler, sharedProps]
    );

    const renderBadges = useCallback(
        () => (
            <ProfileBadges
                ref={badgesTabRef}
                onScroll={badgesScrollHandler}
                {...sharedProps}
            />
        ),
        [badgesTabRef, badgesScrollHandler, sharedProps]
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
                marginTop: insets.top,
            }}
            behavior="height"
            keyboardVerticalOffset={-insets.bottom}
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

            <Tab.Navigator tabBar={renderTabBar}>
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
    floatingActionButton: {
        width: 50,
        height: 50,
        position: "absolute",
        right: 0,
        bottom: 0,
        top: "50%",
        backgroundColor: Colors.purple,
        borderRadius: 25,
        marginRight: 20,
        marginBottom: 40,
        transform: [{ translateY: -45 }],
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99,
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
