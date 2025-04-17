import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";

import {
    useNavigation,
    useIsFocused,
    NavigationProp,
} from "@react-navigation/native";
import AwesomeGallery, {
    GalleryRef,
    RenderItemInfo,
} from "react-native-awesome-gallery";
import * as ScreenOrientation from "expo-screen-orientation";
import { Image } from "expo-image";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { useGlobalState } from "@/src/context/GlobalContext";
import VideoPlayer from "@/src/ui/components/MediaPlayers/VideoPlayer";

export interface GalleryMediaItem {
    uri: string;
    type: "image" | "video";
    id: string;
}

const renderItem = ({
    item,
    setImageDimensions,
}: RenderItemInfo<GalleryMediaItem>) => {
    if (item.type === "video") {
        return <VideoPlayer uri={item.uri} />;
    }
    return (
        <Image
            source={item.uri}
            cachePolicy="memory-disk"
            style={StyleSheet.absoluteFillObject}
            contentFit="contain"
            onLoad={(e) => {
                const { width, height } = e.source;
                setImageDimensions({ width, height });
            }}
        />
    );
};

export const GalleryScreen = () => {
    const globalState = useGlobalState();
    const { top } = useSafeAreaInsets();
    const { goBack } = useNavigation<NavigationProp<any>>();
    const isFocused = useIsFocused();
    const gallery = useRef<GalleryRef>(null);
    const [mounted, setMounted] = useState(false);

    const { activePhotoUri, mediaType } = useLocalSearchParams();

    const { shownMediaInGallery } = globalState;

    const [images, setImages] = useState<GalleryMediaItem[]>([
        {
            uri: activePhotoUri as string,
            type: mediaType as "image" | "video",
            id: activePhotoUri as string,
        },
    ]);
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        const unlockScreenOrientation = async () => {
            await ScreenOrientation.unlockAsync();
            setMounted(true);
        };

        unlockScreenOrientation();

        return () => {
            ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
        };
    }, []);

    useEffect(() => {
        setImages(shownMediaInGallery);
        const i = shownMediaInGallery.findIndex(
            (media) => media.uri === activePhotoUri
        );
        setIndex(i);
        gallery.current?.setIndex(i);
    }, [shownMediaInGallery, activePhotoUri]);

    const [infoVisible, setInfoVisible] = useState(true);

    useEffect(() => {
        StatusBar.setBarStyle(
            isFocused ? "light-content" : "dark-content",
            true
        );
        if (!isFocused) {
            StatusBar.setHidden(false, "fade");
        }
    }, [isFocused]);

    const onIndexChange = useCallback(
        (index: number) => {
            isFocused && setIndex(index);
        },
        [isFocused, setIndex]
    );

    const onTap = () => {
        StatusBar.setHidden(infoVisible, "slide");
        setInfoVisible(!infoVisible);
    };

    if (images.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {infoVisible && (
                <Animated.View
                    entering={mounted ? FadeInUp.duration(250) : undefined}
                    exiting={FadeOutUp.duration(250)}
                    style={[
                        styles.toolbar,
                        {
                            height: top + 60,
                            paddingTop: top,
                        },
                    ]}
                >
                    {/* TODO: Add back button here */}
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>
                            {index + 1} of {images.length}
                        </Text>
                    </View>
                </Animated.View>
            )}
            <AwesomeGallery
                ref={gallery}
                data={images}
                keyExtractor={(item, index) => item.uri}
                renderItem={renderItem}
                initialIndex={index}
                numToRender={3}
                doubleTapInterval={150}
                onIndexChange={onIndexChange}
                onSwipeToClose={goBack}
                onTap={onTap}
                onScaleEnd={(scale) => {
                    if (scale < 0.8) {
                        goBack();
                    }
                }}
            />
        </View>
    );
};

export default GalleryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    toolbar: {
        position: "absolute",
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1,
    },
    headerText: {
        fontSize: 16,
        color: "white",
        fontWeight: "600",
    },
});
