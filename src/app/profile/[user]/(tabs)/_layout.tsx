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
    View,
    KeyboardAvoidingView,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from "react-native";

import * as ScreenOrientation from "expo-screen-orientation";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
    MaterialTopTabBarProps,
    createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { Image } from "expo-image";
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
import { Text } from "@/src/components/design-system/Text";
import ProfileMessages, {
    DisplayableMessage,
} from "@/src/app/profile/[user]/(tabs)/messages.jsx";
import ProfilePictures from "@/src/app/profile/[user]/(tabs)/pictures.jsx";
import ProfileBadges from "@/src/app/profile/[user]/(tabs)/badges.jsx";
import { useGlobalState } from "@/src/context/GlobalContext.js";
import {
    TrustedContact,
    getContactWithTrustRelation,
} from "@/src/db/models/Contacts";
import {
    EnrichedSmashMessage,
    saveMessageToDb,
} from "@/src/db/models/Messages";
import { ProfileTabBar } from "@/src/components/fragments/ProfileTabBar";
import { ProfileHeader } from "@/src/components/fragments/ProfileHeader";
import { MapContactToDid } from "@/src/utils/mappers/contacts";
import { NEIGHBOURHOOD_DOMAIN } from "@/data/neighbourhood";
import useScrollSync from "@/src/hooks/useScrollSync";
import { Avatar } from "@/src/components/Avatar";

export type ProfileIdType = {
    profileId: string;
    onRef: (ref: MutableRefObject<ScrollView>) => void;
};

export type ProfileStackParamList = {
    messages: ProfileIdType;
    pictures: ProfileIdType;
    badges: ProfileIdType;
};

export type HeaderConfig = {
    heightExpanded: number;
    heightCollapsed: number;
};

export type ScrollPair = {
    list:
        | AnimatedRef<Animated.FlatList<DisplayableMessage>>
        | AnimatedRef<Animated.ScrollView>;
    position: SharedValue<number>;
};

export enum Visibility {
    Hidden = 0,
    Visible = 1,
}

const Tab = createMaterialTopTabNavigator<ProfileStackParamList>();

const TAB_BAR_HEIGHT = 48;
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
    const messagesTabRef =
        useAnimatedRef<Animated.FlatList<DisplayableMessage>>();
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
    const scrollPairs = useMemo<ScrollPair[]>(
        () => [
            { list: messagesTabRef, position: messagesScrollValue },
            { list: picturesTabRef, position: picturesScrollValue },
            { list: badgesTabRef, position: badgesScrollValue },
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

    const { sync } = useScrollSync(scrollPairs, headerConfig);

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
                top: heightExpanded + TAB_BAR_HEIGHT + 10,
            },
        }),
        [contentContainerStyle, sync, heightExpanded]
    );

    const сurrentScrollValue = useDerivedValue(
        () => scrollPairs[tabIndex].position.value,
        [tabIndex, scrollPairs]
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

    const renderMessages = useCallback(
        () => (
            <Box flex={1} backgroundColor={Colors.background}>
                <ProfileMessages
                    ref={messagesTabRef}
                    onScroll={messagesScrollHandler}
                    {...sharedProps}
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
        ),
        [messagesTabRef, messagesScrollHandler, sharedProps]
    );

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
                {/* <Header
                    name="Emily Davis"
                    bio="Let's get started 🚀"
                    photo={"https://picsum.photos/id/1027/300/300"}
                /> */}

                <Image
                    style={{
                        width: "100%",
                        height: 300,
                    }}
                    alt="Profile picture"
                    source={peer?.meta_avatar}
                />
                <Text color="white" marginBottom={10}>
                    {peer?.meta_title}
                </Text>
                <Text>
                    {" "}
                    {`sbfh.${NEIGHBOURHOOD_DOMAIN}, u123.users.smashchats.com, BIG`}
                </Text>
            </Animated.View>
            <Animated.View style={collapsedOverlayStyle}>
                <Pressable onPress={expand} style={{ flex: 1 }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            flex: 1,
                            marginHorizontal: 48,
                            width: "50%",
                        }}
                    >
                        <Avatar
                            contact={
                                peer ?? ({ meta_title: "" } as TrustedContact)
                            }
                            variant={"small"}
                        />
                        <Text
                            fontWeight="bold"
                            color="white"
                            fontSize={16}
                            zIndex={50}
                            minHeight={20}
                        >
                            {peer?.trusted_name ?? peer?.meta_title}
                        </Text>
                    </View>
                </Pressable>
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
