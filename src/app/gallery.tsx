import {
    useNavigation,
    useIsFocused,
    NavigationProp,
} from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import AwesomeGallery, {
    GalleryRef,
    RenderItemInfo,
} from "react-native-awesome-gallery";
import * as React from "react";

import { Image } from "expo-image";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalState } from "@/src/context/GlobalContext";
import { useLocalSearchParams } from "expo-router";

const renderItem = ({
    item,
    setImageDimensions,
}: RenderItemInfo<{ uri: string }>) => {
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

    const { activePhotoUri } = useLocalSearchParams();
    const { shownMediaInGallery } = globalState;

    const [images, setImages] = useState<string[]>([activePhotoUri as string]);
    const [index, setIndex] = useState<number>(
        images.findIndex((image) => image === activePhotoUri)
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setImages(shownMediaInGallery);
        const i = shownMediaInGallery.findIndex(
            (uri) => uri === activePhotoUri
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
                data={images.map((uri) => ({ uri }))}
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
